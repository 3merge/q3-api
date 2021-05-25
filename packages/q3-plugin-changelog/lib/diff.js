const {
  isEqual,
  isObject,
  size,
  find,
  get,
  uniqWith,
  pickBy,
} = require('lodash');
const { detailedDiff } = require('deep-object-diff');
const explode = require('./explode');

const sizeOf = (xs) =>
  (isObject(xs) ? size(Object.keys(xs)) : 0) > 0;

const invokeDetailedDiffWithOmission = (...params) =>
  detailedDiff(
    ...params.map(explode.omitByKeyName(['_id'])),
  );

const pickWithMongoId = (xs, keys = []) =>
  pickBy(xs, (value, key) =>
    ['_id'].concat(keys).some(key.includes.bind(key)),
  );

const getDetailedDiff = (direction) => (a = {}, b = {}) =>
  Object.entries(
    direction === 'ltr'
      ? invokeDetailedDiffWithOmission(a, b)
      : invokeDetailedDiffWithOmission(b, a),
  ).reduce((acc, curr) => {
    const [key, value] = curr;

    if (sizeOf(value))
      acc[key] =
        key === 'deleted'
          ? a
          : {
              ...pickWithMongoId(a),
              ...pickWithMongoId(b),
              ...value,
            };

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
    const match = findByKeyValue(b, key, get(item, key));
    const output = next(item, match);
    return output ? acc.concat(output) : acc;
  }, []);

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
    ].filter(sizeOf),
    isEqual,
  );
};
