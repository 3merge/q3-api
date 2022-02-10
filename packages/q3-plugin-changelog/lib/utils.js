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
const BatchQueryLoader = require('q3-plugin-extref/lib/BatchQueryLoader');
const diff = require('./diff');

const getChangelogCollection = (xs) =>
  mongoose.connection.db.collection(`${xs}-changelog-v2`);

const someMatch = (a, b) =>
  some(a, (item) =>
    new RegExp(
      `^${String(item).replace(/\$/g, '(\\d)')}$`,
    ).test(b),
  );

const printName = (o) =>
  join(compact([o.firstName, o.lastName]), ' ');

const hasKeys = (v) => isObject(v) && size(Object.keys(v));

// fixes the issue of auto-populated references in the changelog
const invokeBatchQueryLoader = async (
  schemaName,
  data = [],
) => {
  try {
    const batch = new BatchQueryLoader(
      mongoose.model(schemaName).schema,
    );

    if (batch.isReady) {
      const docs = [].concat(data);
      docs.map(batch.registerIds.bind(batch));
      await batch.fetch();
      docs.map(batch.assign.bind(batch));
    }

    return data;
  } catch (e) {
    return data;
  }
};

const insertIntoChangelog = async (
  collectionName,
  reference,
  snapshot,
) => {
  try {
    const date = new Date();
    const benchmark = await mongoose.connection.db
      .collection('changelog-v2-snapshots')
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

    const previousSnapshot = get(
      benchmark,
      'value.snapshot',
    );

    const changes = diff(
      ...(await invokeBatchQueryLoader(
        get(snapshot, '__t', collectionName),
        [previousSnapshot, snapshot],
      )),
    );

    const includeUserId = () => {
      const userId = get(snapshot, 'lastModifiedBy.id');

      return (!isObject(previousSnapshot) ||
        previousSnapshot.changelog !==
          snapshot.changelog) &&
        userId
        ? {
            user: mongoose.Types.ObjectId(userId),
          }
        : {};
    };

    await getChangelogCollection(collectionName).insertMany(
      map(changes, (change) => ({
        ...flat.unflatten(change),
        ...includeUserId(),
        date,
        collectionName,
        reference,
      })),
    );
  } catch (e) {
    // noop
  }
};

const seedChangelog = async (collectionName, reference) => {
  try {
    if (!reference)
      throw new Error(
        'ID required to seed collection changelog',
      );

    const snapshot = await mongoose.connection.db
      .collection(collectionName)
      .findOne({
        _id: reference,
      });

    await mongoose.connection.db
      .collection('changelog-v2-snapshots')
      .insert({
        collectionName,
        reference,
        snapshot,
      });
  } catch (e) {
    // noop
  }
};

const omitByKeyName =
  (keylist = []) =>
  (xs) =>
    omitBy(flat(xs), (value, key) =>
      keylist.some((phrase) => key.includes(phrase)),
    );

module.exports = {
  getChangelogCollection,
  insertIntoChangelog,
  printName,
  someMatch,
  hasKeys,
  omitByKeyName,
  seedChangelog,
};
