const {
  some,
  compact,
  join,
  isObject,
  size,
} = require('lodash');
const flat = require('flat');
const mongoose = require('mongoose');
const alphabetize = require('alphabetize-object-keys');

const someMatch = (a, b) =>
  some(a, (item) =>
    new RegExp(
      `^${String(item).replace(/\$/g, '(\\d)*')}$`,
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

const unwrap = (v) => flat.unflatten(alphabetize(v));

const insertIntoChangelog = async (
  collectionName,
  reference,
  op,
  user,
) => {
  try {
    const updatedFields = unwrap(op.updatedFields);
    const removedFields = unwrap(op.removedFields);

    if (hasKeys(updatedFields) || hasKeys(removedFields))
      await getChangelogCollection(
        collectionName,
      ).insertOne({
        modifiedBy: user ? printName(user) : 'Sys',
        modifiedOn: new Date(),
        reference,
        removedFields,
        updatedFields,
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
          updatedFields: 1,
          removedFields: 1,
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
};
