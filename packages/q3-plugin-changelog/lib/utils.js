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

const insertIntoChangelog = async (
  collectionName,
  reference,
  snapshot,
) => {
  try {
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

    const changes = diff(previousSnapshot, snapshot);

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
        date: new Date(),
        collectionName,
        reference,
      })),
    );
  } catch (e) {
    // noop
  }
};

const makeOp = (xs) => {
  const output = {};
  if (!isObject(xs)) return output;
  const { date, user, operations } = xs;

  if (date)
    output.date = {
      $lte: new Date(xs.date),
    };

  if (user)
    output.user = {
      $eq: mongoose.Types.ObjectId(xs.user),
    };

  if (Array.isArray(operations))
    Object.entries(operations).forEach((key) => {
      output[key] = {
        $ne: null,
      };
    });

  return output;
};

const getFromChangelog = (collectionName, op = {}) => {
  try {
    return new Promise((resolve, reject) =>
      getChangelogCollection(collectionName)
        .aggregate([
          {
            $match: {
              collectionName,
              ...makeOp(op),
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
          {
            $limit: 250,
          },
          {
            $skip: op.skip || 0,
          },
          {
            $lookup: {
              from: 'q3-api-users',
              localField: 'user',
              foreignField: '_id',
              as: 'users',
            },
          },
          {
            $project: {
              _id: 0,
              ...(isObject(op) && 'reference' in op
                ? {}
                : {
                    reference: 1,
                  }),
              added: 1,
              updated: 1,
              deleted: 1,
              previous: 1,
              date: 1,
              'user._id': {
                $first: '$users._id',
              },
              'user.firstName': {
                $first: '$users.firstName',
              },
              'user.lastName': {
                $first: '$users.lastName',
              },
            },
          },
        ])
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        }),
    );
  } catch (e) {
    return null;
  }
};

const omitByKeyName =
  (keylist = []) =>
  (xs) =>
    omitBy(flat(xs), (value, key) =>
      keylist.some((phrase) => key.includes(phrase)),
    );

module.exports = {
  getFromChangelog,
  getChangelogCollection,
  insertIntoChangelog,
  printName,
  someMatch,
  hasKeys,
  omitByKeyName,
};
