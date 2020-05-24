const {
  get,
  pick,
  omit,
  isEqual,
  reduce,
  isPlainObject,
} = require('lodash');
const flat = require('flat');
const micromatch = require('micromatch');

const prefixCollectionName = (name) =>
  `${name}-patch-history`;

const mapWithoutIds = (a = []) =>
  a.map(({ _id, ...res }) => res);

exports.getCollectionName = (inst) =>
  get(inst, 'constructor.collection.collectionName');

exports.getUserMeta = (v) => {
  return pick(get(v, '__$q3.USER', {}), [
    'id',
    'firstName',
    'lastName',
    'email',
  ]);
};

exports.hasKeys = (o) =>
  o !== null &&
  o !== undefined &&
  typeof o === 'object' &&
  Object.keys(o).length > 0;

exports.insertToPatchHistory = (
  inst,
  collectionName,
  op,
) => {
  try {
    return inst.connection.db
      .collection(prefixCollectionName(collectionName))
      .insertOne(op);
  } catch (e) {
    return null;
  }
};

exports.getFromPatchHistory = (
  inst,
  collectionName,
  op,
) => {
  return new Promise((resolve) => {
    try {
      return inst.connection.db
        .collection(prefixCollectionName(collectionName))
        .find(op)
        .sort({ modifiedOn: -1 })
        .toArray((err, docs) =>
          resolve(err ? null : mapWithoutIds(docs)),
        );
    } catch (e) {
      return null;
    }
  });
};

const diff = (a, b, fields = []) => {
  if (!a || !b) return {};

  const inner = flat(a);
  const out = flat(b);

  const output = reduce(
    inner,
    (result, value, key) => {
      if (!isEqual(value, out[key]))
        Object.assign(result, {
          [key]: {
            ...(out[key]
              ? {
                  prev: out[key],
                }
              : {}),
            curr:
              isPlainObject(value) &&
              isPlainObject(out[key])
                ? diff(value, out[key])
                : value,
          },
        });

      return result;
    },
    {},
  );

  return micromatch(Object.keys(output), fields).reduce(
    (acc, key) => {
      acc[key.replace(/\./g, '%2E')] = output[key];
      return acc;
    },
    {},
  );
};

exports.diff = diff;
