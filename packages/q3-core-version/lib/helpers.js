const { get } = require('lodash');

const prefixCollectionName = (name) =>
  `${name}-patch-history`;

const mapWithoutIds = (a = []) =>
  a.map(({ _id, ...res }) => res);

exports.getCollectionName = (inst) =>
  get(inst, 'constructor.collection.collectionName');

exports.getUserMeta = (v) => {
  const u = get(v, '__$q3.USER', null);
  if (!u) return null;
  return `${u.firstName} ${u.lastName}`;
};

exports.insertToPatchHistory = (
  inst,
  collectionName,
  op,
) => {
  try {
    return inst.connection.db
      .collection(prefixCollectionName(collectionName))
      .insert(op);
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
