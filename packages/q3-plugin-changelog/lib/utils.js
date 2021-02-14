const { get, some } = require('lodash');
const flat = require('flat');
const mongoose = require('mongoose');
const { diff } = require('deep-diff');

const someMatch = (a, b) =>
  some(a, (item) =>
    new RegExp(String(item).replace(/\$/g, '(\\d)*')).test(
      b,
    ),
  );

const getLast = (col) =>
  col.find().sort({ _id: -1 }).limit(1).toArray();

const isUpdateOp = (resp) =>
  resp.operationType === 'update';

const prefixCollectionName = (name) =>
  `${name}-patch-history`;

const insertIntoChangelog = async (
  collectionName,
  reference,
  op,
) => {
  try {
    const src = mongoose.connection.db.collection(
      prefixCollectionName(collectionName),
    );

    const snapshot = flat.unflatten(op);
    const res = diff(
      get(await getLast(src), '0.snapshot', {}),
      snapshot,
    );

    if (diff)
      return src.insertOne({
        modifiedOn: new Date(),
        diff: res,
        reference,
        snapshot,
      });
  } catch (e) {
    return null;
  }
};

const getFromChangelog = (collectionName, op = {}) => {
  try {
    return new Promise((resolve, reject) =>
      mongoose.connection.db
        .collection(prefixCollectionName(collectionName))
        .find(op)
        .project({
          diff: 1,
          modifiedOn: 1,
        })
        .sort({
          modifiedOn: -1,
        })
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        }),
    );
  } catch (e) {
    return null;
  }
};

module.exports = {
  isUpdateOp,
  getFromChangelog,
  insertIntoChangelog,
  someMatch,
};
