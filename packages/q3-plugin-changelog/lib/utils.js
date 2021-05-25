const {
  some,
  compact,
  join,
  isObject,
  size,
  map,
  get,
  omitBy,
} = require('lodash');
const flat = require('flat');
const mongoose = require('mongoose');
const diff = require('./diff');

const someMatch = (a, b) =>
  some(a, (item) =>
    new RegExp(
      `^${String(item).replace(/\$/g, '(\\d)')}$`,
    ).test(b),
  );

const printName = (o) =>
  join(compact([o.firstName, o.lastName]), ' ');

const hasKeys = (v) => isObject(v) && size(Object.keys(v));

const insertIntoChangelog = async (
  collectionName,
  reference,
  snapshot,
) => {
  try {
    const benchmark = await mongoose.connection.db
      .collection('changelog-versions')
      .findOneAndReplace(
        {
          collectionName,
          reference,
        },
        {
          snapshot,
          collectionName,
          reference,
        },
        {
          upsert: true,
        },
      );

    const changes = diff(
      get(benchmark, 'value.snapshot'),
      snapshot,
    );

    console.log(changes);

    await mongoose.connection.db
      .collection('changelog')
      .insertMany(
        map(changes, (change) => ({
          ...flat.unflatten(change),
          date: new Date(),
          user: snapshot.lastModifiedBy,
          collectionName,
          reference,
        })),
      );
  } catch (e) {
    // noop
  }
};

const getFromChangelog = (collectionName, op = {}) => {
  try {
    return new Promise((resolve, reject) =>
      mongoose.connection.db
        .collection('changelog')
        .find({
          collectionName,
          ...op,
        })
        .sort({ date: -1 })
        .limit(500)
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        }),
    );
  } catch (e) {
    return null;
  }
};

const omitByKeyName = (keylist = []) => (xs) =>
  omitBy(flat(xs), (value, key) =>
    keylist.some((phrase) => key.includes(phrase)),
  );

module.exports = {
  getFromChangelog,
  insertIntoChangelog,
  printName,
  someMatch,
  hasKeys,
  omitByKeyName,
};
