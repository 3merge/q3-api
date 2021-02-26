const {
  some,
  compact,
  join,
  isObject,
  size,
} = require('lodash');
const flat = require('flat');
const mongoose = require('mongoose');

const someMatch = (a, b) =>
  some(a, (item) =>
    new RegExp(
      `^${String(item).replace(/\$/g, '(\\d)')}$`,
    ).test(b),
  );

const prefixCollectionName = (name) =>
  `${name}-patch-history`;

const printName = (o) =>
  join(compact([o.firstName, o.lastName]), ' ');

const getChangelogCollection = (collectionName) =>
  mongoose.connection.db.collection(
    prefixCollectionName(collectionName),
  );

const hasKeys = (v) => isObject(v) && size(Object.keys(v));

const insertIntoChangelog = async (
  collectionName,
  reference,
  op,
) => {
  try {
    await getChangelogCollection(collectionName).insertOne({
      nextgen: true,
      snapshot: flat.unflatten(op),
      reference,
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
          snapshot: 1,
        })
        .sort({
          _id: -1,
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

const reduceByKeyMatch = (doc = {}, changelog = []) => {
  if (isObject(doc))
    return Object.entries(flat(doc)).reduce(
      (acc, [key, value]) => {
        if (someMatch(changelog, key)) acc[key] = value;
        return acc;
      },
      {},
    );

  return {};
};

module.exports = {
  getFromChangelog,
  insertIntoChangelog,
  printName,
  someMatch,
  reduceByKeyMatch,
  hasKeys,
};
