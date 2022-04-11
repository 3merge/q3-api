const { queue } = require('q3-core-scheduler');
const {
  map,
  every,
  includes,
  get,
  size,
  uniqWith,
  isEqual,
  compact,
  isFunction,
  isObject,
  set,
  isString,
  groupBy,
  first,
  pick,
  isNil,
  omit,
  some,
} = require('lodash');
const Comparison = require('comparisons');
const {
  makeSessionPayload,
} = require('q3-core-access/lib/helpers');
const session = require('q3-core-session');
const {
  getId,
  mapIdToString,
  notInclusive,
} = require('./utils');

const MongooseSchedulerDispatchPlugin = (
  Schema,
  args = {},
) => {
  const notifications = compact([args].flat());

  const batch = async (d) =>
    Promise.all(
      Object.entries(groupBy(d, 'name')).map(
        ([name, b]) => {
          const len = size(b);
          const obj = first(b);
          const delay = get(obj, 'delay', 0);

          const clean = (xs) => omit(xs, ['delay', 'name']);

          if (len === 0) return null;
          return len === 1
            ? queue(name, clean(obj), 1, delay)
            : queue(
                name,
                {
                  batch: map(b, clean),
                },
                1,
                delay,
              );
        },
      ),
    );

  async function execRule(
    {
      path,
      name,
      capture = [],
      test = {},
      when = {},
      ...etc
    },
    currentEvalObject,
    dispatch,
    previous = [],
  ) {
    const evalObj = {
      ...currentEvalObject,
      ...(path
        ? {
            [path]: this.toJSON(),
          }
        : {}),
    };

    const decoratedDispatch = (subEtc = {}) => {
      dispatch({
        name,
        context: pick(evalObj, capture),
        ...subEtc,
        ...etc,
      });
    };

    const includesModified = (xs) =>
      every(when.modified, (modifiedPath) =>
        includes(
          isString(path)
            ? map(xs, (item) => `${path}.${item}`)
            : xs,
          modifiedPath,
        ),
      );

    const hasWhenConditions = () =>
      when.new || when.deleted || size(when.modified) > 0;

    const hasModifications = () =>
      includesModified(this.directModifiedPaths());

    const hasMatchingNewState = () =>
      isNil(when.new) ? true : this.isNew === when.new;

    const passesTest = async () => {
      if (isFunction(test)) return test(evalObj);

      const out =
        Array.isArray(test) ||
        (isObject(test) && size(Object.keys(test)))
          ? new Comparison(test).eval(evalObj)
          : true;

      return out;
    };

    const hasRemoved = async () => {
      if (path) {
        const pre = mapIdToString(previous);
        const now = mapIdToString(get(this.parent(), path));
        return some(pre, notInclusive(now));
      }

      // see session archive functionality
      return this.isModified('active') && !this.active;
    };

    if (get(when, 'deleted', false)) {
      if (await hasRemoved()) decoratedDispatch();
    } else if (
      hasWhenConditions() &&
      (await passesTest()) &&
      hasModifications() &&
      hasMatchingNewState()
    )
      decoratedDispatch(
        path
          ? {
              subDocumentId: this._id,
              subDocumentAuthor: getId(this.createdBy),
            }
          : {
              subDocumentId: null,
              subDocumentAuthor: null,
            },
      );
  }

  Schema.pre('save', async function watch() {
    const evalObj = {
      ...this.toJSON(),
      ...makeSessionPayload(),
    };

    const paths = compact(
      map(notifications, (notification) =>
        get(notification, 'when.deleted')
          ? notification.name
          : null,
      ),
    );

    const previous = size(paths)
      ? await this.constructor
          .findById(this._id)
          // all paths WITH DELETE
          .select(`+${paths.join(' +')}`)
          .lean()
          .exec()
      : {};

    const dispatch = (rest = {}) =>
      set(
        this.$locals,
        'dispatchers',
        uniqWith(
          compact([
            ...get(this, '$locals.dispatchers', []),
            {
              documentAuthor: getId(this.createdBy),
              documentId: this._id,
              userId: session.get('USER', '_id'),
              ...rest,
            },
          ]),
          isEqual,
        ),
      );

    await Promise.all(
      map(notifications, async (item) => {
        if (item.path) {
          return Promise.all(
            map(get(this, item.path), (subDoc) =>
              execRule.call(
                subDoc,
                item,
                evalObj,
                dispatch,
                get(previous, item.path, []),
              ),
            ),
          );
        }

        return execRule.call(
          this,
          item,
          evalObj,
          dispatch,
          previous,
        );
      }),
    );
  });

  Schema.post(
    'save',
    session.connect(async (doc) => {
      await batch(get(doc, '$locals.dispatchers', []));

      if (isObject(doc.$locals)) {
        Object.assign(doc.$locals, {
          dispatchers: [],
        });
      }
    }),
  );

  return Schema;
};

module.exports = MongooseSchedulerDispatchPlugin;
