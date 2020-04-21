const { get, pick } = require('lodash');

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
        .toArray((err, docs) =>
          resolve(err ? null : mapWithoutIds(docs)),
        );
    } catch (e) {
      return null;
    }
  });
};
