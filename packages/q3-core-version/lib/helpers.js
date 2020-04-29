const {
  get,
  pick,
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
  const inner = flat(a, { safe: true });
  const out = flat(b, { safe: true });

  const output = reduce(
    inner,
    (result, value, key) => {
      if (!isEqual(value, out[key])) {
        // eslint-disable-next-line
        result[key] =
          isPlainObject(value) && isPlainObject(out[key])
            ? diff(value, out[key])
            : value;
      }

      return result;
    },
    {},
  );

  micromatch(Object.keys(output), fields).forEach((key) => {
    delete output[key];
  });

  return flat.unflatten(output);
};

exports.diff = diff;
