const {
  appendRef,
  cleanPath,
  removeTrailing,
} = require('./helpers');

const last = (a) =>
  Array.isArray(a) ? a[a.length - 1] : undefined;

const mergePaths = (s) => String(s).replace(/\./g, '');
const splitByOperator = (s) => String(s).split('$');

const getSinglePath = (key) =>
  last(splitByOperator(mergePaths(key)));

const getEmbeddedFilterPath = (path) =>
  ['embed', path, 'ref'].filter(Boolean).join('.');

const ReferenceReader = (key, value, context) => {
  const { active } = context;
  const ref = appendRef(key);

  const isEmbedded = key.includes('$');
  const isEmbeddedPullOp = isEmbedded && !active;
  const isEmbeddedUnsetOp =
    isEmbeddedPullOp && !key.endsWith('$');
  const isEmbeddedSetOp = isEmbedded && active;
  const isPullOp = !isEmbedded && !active;
  const isSetOp = !isEmbedded && active;

  const maekKey = () => {
    const s = key.replace(/\$/g, '$[]');

    const n = s.endsWith('[]')
      ? s.substring(0, s.length - 4)
      : s;

    const pos = s.lastIndexOf('.$[]');
    const str =
      pos !== -1
        ? `${n.substring(0, pos)}.$[embed]${n.substring(
            pos + 4,
          )}`
        : n;

    return str;
  };

  const getTargets = (prefix = '') =>
    value.reduce((acc, curr) => {
      acc[`${prefix}${curr}`] = context[curr];
      return acc;
    }, {});

  const isUpdateEmbeddedReferenceOperation =
    context.active && isEmbedded;

  return {
    isEmbeddedSetOp,
    isEmbeddedPullOp,
    isEmbeddedUnsetOp,
    isEmbedded,
    isPullOp,
    isSetOp,
    ref,

    get element() {
      return key.endsWith('.$')
        ? key.substring(0, key.length - 2)
        : key;
    },

    __$untilTruthy(conditions, defaultValue) {
      return (
        Object.entries(conditions).reduce(
          (acc, [currentKey, currentValue]) => {
            const match = this[currentKey];
            if (acc || !match) return acc;
            return currentValue;
          },
          undefined,
        ) || defaultValue
      );
    },

    queryParams(id) {
      const param =
        (!isEmbedded && !context.active) || !isEmbedded
          ? ref
          : 'ref';

      const match = {
        [param]: id,
      };

      return this.__$untilTruthy(
        {
          isEmbeddedSetOp: {
            [ref]: id,
          },
          isEmbeddedUnsetOp: {
            [`${removeTrailing(cleanPath(key))}.ref`]: id,
          },
          isEmbeddedPullOp: {
            [removeTrailing(cleanPath(key))]: {
              $elemMatch: match,
            },
          },
        },
        match,
      );
    },

    getTargets() {
      if (isUpdateEmbeddedReferenceOperation)
        return getTargets(`${maekKey()}.`);

      if (!isEmbedded) return getTargets();
      return {};
    },

    getUpdate(id) {
      const $set = this.getTargets();

      return this.__$untilTruthy(
        {
          isEmbeddedSetOp: {
            $set,
          },
          isSetOp: {
            $set: {
              [key]: $set,
            },
          },
          isPullOp: {
            $unset: {
              [key]: '',
            },
          },
          isEmbeddedUnsetOp: {
            $unset: {
              [`${maekKey()}`]: '',
            },
          },
          isEmbeddedPullOp: {
            $pull: {
              [this.element]: {
                ref: id,
              },
            },
          },
        },
        $set,
      );
    },

    getOptions(comparison) {
      if (
        isUpdateEmbeddedReferenceOperation ||
        isEmbeddedUnsetOp
      )
        return {
          arrayFilters: [
            {
              [getEmbeddedFilterPath(
                getSinglePath(key),
              )]: comparison,
            },
          ],
        };

      return {};
    },

    spread(id) {
      return value.length
        ? [
            this.queryParams,
            this.getUpdate,
            this.getOptions,
          ].map((fn) => fn.call(this, id))
        : [];
    },
  };
};

ReferenceReader.setup = (context) => ([key, value]) =>
  ReferenceReader(key, value, context);

module.exports = ReferenceReader;
