const {
  get,
  some,
  compact,
  join,
  isObject,
  size,
} = require('lodash');
const flat = require('flat');
const mongoose = require('mongoose');
const { diff } = require('deep-diff');

const someMatch = (a, b) =>
  some(a, (item) =>
    new RegExp(String(item).replace(/\$/g, '(\\d)*')).test(
      b,
    ),
  );

const getLast = (col, reference) =>
  col
    .find({ reference })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

const prefixCollectionName = (name) =>
  `${name}-patch-history`;

const printName = (o) =>
  join(compact([o.firstName, o.lastName]), ' ');

const getChangelogCollection = (collectionName) =>
  mongoose.connection.db.collection(
    prefixCollectionName(collectionName),
  );

const compareWithLastSnapshot = async (
  src,
  reference,
  currentSnapshot,
) =>
  diff(
    get(await getLast(src, reference), '0.snapshot', {}),
    currentSnapshot,
  );

const insertIntoChangelog = async (
  collectionName,
  reference,
  op,
  user,
) => {
  try {
    const snapshot = flat.unflatten(op);
    const src = getChangelogCollection(collectionName);
    const res = await compareWithLastSnapshot(
      src,
      reference,
      snapshot,
    );

    if (isObject(res) && size(Object.keys(res)))
      await src.insertOne({
        modifiedBy: user ? printName(user) : 'Sys',
        modifiedOn: new Date(),
        diff: res,
        reference,
        snapshot,
      });
  } catch (e) {
    // noop
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
          modifiedBy: 1,
        })
        .sort({
          modifiedOn: -1,
        })
        .limit(100)
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        }),
    );
  } catch (e) {
    return null;
  }
};

const reduceByKeyMatch = (doc = {}, changelog = []) =>
  Object.entries(flat(doc)).reduce((acc, [key, value]) => {
    if (someMatch(changelog, key)) acc[key] = value;
    return acc;
  }, {});

module.exports = {
  getFromChangelog,
  insertIntoChangelog,
  printName,
  someMatch,
  reduceByKeyMatch,
};
