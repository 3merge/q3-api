const {
  first,
  get,
  groupBy,
  map,
  uniq,
  isObject,
  isFunction,
  join,
  compact,
} = require('lodash');
const ModelProxy = require('./ModelProxy');

const getPath = (v) =>
  isObject(v) && 'path' in v ? v.path : null;

const getFirst = (method) => (o) =>
  isObject(o) ? first(Object[method](o)) : undefined;

const getFirstKey = getFirst('keys');
const getFirstValue = getFirst('values');

const cleanPath = (v) => {
  if (typeof v !== 'string')
    throw new Error('Key must be a string');

  return v.replace(/\$\[\]/g, '').replace(/(\.\.)/g, '.');
};

exports.isDefined = (v) =>
  v !== null && v !== undefined && v !== '';

exports.setPrefix = (p, name) =>
  `${
    typeof p === 'string' && p.length ? `${p}.` : ''
  }${name}`;

exports.pushUniquely = (a, i) =>
  a.filter(Boolean).findIndex((item) => {
    const inbound = getPath(item);
    const target = getPath(i);
    return inbound === target || !inbound || !target;
  }) === -1
    ? a.push(i)
    : 0;

exports.getSync = (v) =>
  get(v, 'schema.options.sync', null);

exports.getSyncPaths = (v) =>
  Object.keys(get(v, 'schema.paths', {})).filter(
    (name) => !['ref', '_id', '__v'].includes(name),
  );

exports.concatenate = (...a) => join(compact(a), '');

exports.getPreSync = (v) =>
  get(v, 'schema.options.preSync', null);

exports.removeTrailing = (s) =>
  s.endsWith('.') ? s.substring(0, s.length - 1) : s;

exports.appendRef = (v) => {
  let key = cleanPath(v);
  if (!key.endsWith('.')) key += '.';
  key += 'ref';

  return key;
};

exports.filterByPrivateProps = ([key, v]) => [
  key,
  Array.isArray(v)
    ? v.filter(
        (val) =>
          ![
            '_id',
            'updatedAt',
            'createdAt',
            'createdBy',
            'ngrams',
          ].includes(val),
      )
    : v,
];

exports.reduceByContext = (ctx, key) => (a, next) =>
  !ctx
    ? a
    : Object.assign(a, {
        [`${key}.${next}`]: ctx[next],
      });

exports.cleanPath = cleanPath;

exports.forEachCollectionAsync = (
  collections,
  collectionsNameResolver,
) => async (fn) =>
  Promise.allSettled(
    collections.map((collection) =>
      fn(
        new ModelProxy(collection, collectionsNameResolver),
      ),
    ),
  );

// eslint-disable-next-line
exports.markModifiedLocalVars = function () {
  this.$locals.wasNew = this.isNew;
  this.$locals.wasModifiedPaths = this.modifiedPaths();
};

// eslint-disable-next-line
exports.executeMiddlewareOnUpdate = (next) => {
  return !this.$locals || !this.$locals.wasNew
    ? function preserverThisContext() {
        return next.call(this);
      }
    : () => {
        // noop
      };
};

exports.getFirstTruthySpec = (context) => (
  conditions,
  defaultValue,
) =>
  Object.entries(conditions).reduce(
    (acc, [currentKey, currentValue]) => {
      let match = context[currentKey];
      if (isFunction(match)) match = match();
      if (acc || !match) return acc;
      return currentValue;
    },
    undefined,
  ) || defaultValue;

exports.createQueueData = (queries) =>
  map(
    Object.entries(groupBy(queries, 'collection')),
    ([collection, v]) => {
      const flatten = map(v, 'query');
      const keys = uniq(map(flatten, getFirstKey));
      const id = getFirstValue(first(flatten));

      return {
        collection,
        keys,
        id,
      };
    },
  );
