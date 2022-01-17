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

const makeOp = (xs) => {
  const output = {};
  if (!isObject(xs)) return output;
  const { date, user, operation, reference, search } = xs;

  const and = (args) => {
    if (Array.isArray(output.$and)) {
      output.$and = output.$and.concat([
        {
          $or: args,
        },
      ]);
    } else {
      output.$and = [
        {
          $or: args,
        },
      ];
    }
  };

  if (date)
    output.date = {
      $lte: new Date(date),
    };

  if (reference)
    output.reference = {
      $eq: mongoose.Types.ObjectId(reference),
    };

  if (user)
    output.user = {
      $eq: mongoose.Types.ObjectId(user),
    };

  if (search)
    and(
      ['added', 'deleted', 'updated'].map((op) => ({
        [[op, search].join('.')]: {
          $exists: true,
        },
      })),
    );

  if (Array.isArray(get(operation, '$in')))
    and(
      operation.$in.map((item) => ({
        [item]: {
          $ne: null,
        },
      })),
    );
  else if (operation)
    output[operation] = {
      $ne: null,
    };

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
            $limit: 150,
          },
          {
            $skip: (op.skip || 0) * 150,
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
                $arrayElemAt: ['$users._id', 0],
              },
              'user.firstName': {
                $arrayElemAt: ['$users.firstName', 0],
              },
              'user.lastName': {
                $arrayElemAt: ['$users.lastName', 0],
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

const getDistinctUsers = (collectionName, op = {}) => {
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
            $group: {
              _id: '$user',
            },
          },
          {
            $lookup: {
              from: 'q3-api-users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $project: {
              _id: 1,
              email: '$user.email',
              name: {
                $concat: [
                  '$user.firstName',
                  ' ',
                  '$user.lastName',
                ],
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
  getFromChangelog,
  getChangelogCollection,
  getDistinctUsers,
  insertIntoChangelog,
  printName,
  someMatch,
  hasKeys,
  omitByKeyName,
  seedChangelog,
};
