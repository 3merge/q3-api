const {
  isEqual,
  isObject,
  size,
  find,
  get,
  uniqWith,
  pickBy,
  pick,
  first,
  merge,
} = require('lodash');
const { detailedDiff } = require('deep-object-diff');
const explode = require('./explode');

const sizeOf = (xs, opts = {}) => {
  if (!isObject(xs)) return false;
  const keys = Object.keys(xs).filter((item) =>
    opts && opts.excludeIdKeys
      ? !item.includes('_id')
      : true,
  );

  const len = size(keys);

  if (len > 1) return true;
  if (len === 1) return !isEqual(xs[first(keys)], {});
  return false;
};

const invokeDetailedDiffWithOmission = (...params) =>
  detailedDiff(
    ...params.map(explode.omitByKeyName(['_id'])),
  );

const pickWithMongoId = (xs, keys = []) =>
  pickBy(xs, (value, key) =>
    ['_id'].concat(keys).some(key.includes.bind(key)),
  );

const getDetailedDiff =
  (direction) =>
  (a = {}, b = {}) =>
    Object.entries(
      direction === 'ltr'
        ? invokeDetailedDiffWithOmission(a, b)
        : invokeDetailedDiffWithOmission(b, a),
    ).reduce((acc, curr) => {
      const [key, value] = curr;
      const prev = direction === 'ltr' ? a : b;

      if (sizeOf(value)) {
        if (key === 'deleted') {
          const newValue = pick(a, Object.keys(value));

          if (sizeOf(newValue)) {
            acc[key] = newValue;
          }
        } else {
          acc[key] = {
            ...pickWithMongoId(a),
            ...pickWithMongoId(b),
            ...value,
          };

          // how could it be new if there's a previous version?
          if (
            sizeOf(prev, {
              excludeIdKeys: true,
            })
          )
            acc.previous = prev;
        }
      }

      return acc;
    }, {});

const getMongoIdKey = (xs) =>
  Object.keys(xs).find((item) =>
    String(item).includes('_id'),
  );

const findByKeyValue = (xs, key, value) =>
  find(xs, (item) => {
    const id = get(item, key);

    try {
      return id.equals(value);
    } catch (e) {
      return id === value;
    }
  });

const reduceByComparison = (a = [], b = [], next) =>
  a.reduce((acc, item) => {
    const key = getMongoIdKey(item);
    if (!key) return acc;

    const match = findByKeyValue(b, key, get(item, key));
    const output = next(item, match);
    return output ? acc.concat(output) : acc;
  }, []);

const doesNotMatchPrevious = (xs) => {
  if (!sizeOf(xs)) return false;
  if (xs.deleted || xs.added) return true;
  return !isEqual(xs.previous, xs.updated);
};

const removeIds = (xs) =>
  isObject(xs)
    ? Object.entries(xs).reduce((acc, [key, value]) => {
        if (
          key.includes('_id') ||
          key.includes('.id') ||
          key === 'id'
        )
          return acc;

        if (Array.isArray(value)) {
          acc[key] = value.map(removeIds);
        } else if (isObject(value)) {
          acc[key] = removeIds(value);
        } else {
          acc[key] = value;
        }

        return acc;
      }, {})
    : xs;

const hasOps = (xs) =>
  isObject(xs)
    ? xs.added || xs.updated || xs.deleted
    : false;

const mergeUpdateOps = (xs) => {
  try {
    const copy = { ...xs };

    if (copy.previous) {
      const updated = merge({}, xs.updated, xs.added);

      if (sizeOf(updated)) {
        copy.updated = updated;
      }

      delete copy.added;
    }

    return copy;
  } catch (e) {
    return xs;
  }
};

module.exports = (a, b) => {
  const explodedA = explode(a);
  const explodedB = explode(b);

  return uniqWith(
    [
      ...reduceByComparison(
        explodedA,
        explodedB,
        getDetailedDiff('ltr'),
      ),
      ...reduceByComparison(
        explodedB,
        explodedA,
        getDetailedDiff('rtl'),
      ),
    ]
      .filter(doesNotMatchPrevious)
      .reduce((acc, curr) => {
        const cleaned = mergeUpdateOps(removeIds(curr));
        if (hasOps(cleaned)) acc.push(cleaned);
        return acc;
      }, []),
    isEqual,
  );
};
