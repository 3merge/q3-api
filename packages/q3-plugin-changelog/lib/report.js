const mongoose = require('mongoose');
const { Grant, Redact } = require('q3-core-access');
const session = require('q3-core-session');
const {
  compact,
  get,
  map,
  merge,
  isEqual,
  isFunction,
  isNil,
  pick,
  size,
  uniqWith,
  isObject,
} = require('lodash');
const alpha = require('alphabetize-object-keys');

const USER_COLLECTION_NAME = 'q3-api-users';

const getUserGrant = (collection) =>
  new Grant(session.get('USER'))
    .can('Read')
    .on(collection)
    .first();

const canSessionUserSeeUserNames = () => {
  try {
    return (
      Redact.flattenAndReduceByFields(
        { name: 1 },
        getUserGrant(USER_COLLECTION_NAME),
        { includeConditionalGlobs: false },
      ).name === 1
    );
  } catch (e) {
    return false;
  }
};

const castPathsToQueryForExistence = (paths = []) =>
  paths.flatMap((item) =>
    ['added', 'deleted', 'updated'].map((op) => ({
      [`${op}.${item}`]: {
        $exists: true,
      },
    })),
  );

const convertStringToArray = (str) =>
  compact(
    Array.isArray(str) ? str : String(str).split(','),
  );

const isNotEmpty = (key) => ({
  [key]: {
    $not: {
      $size: 0,
    },
  },
});

const getIndexKey = (xs, t) => {
  const str = String(xs);
  const cleaned = str.replace(/\.(\d+)/g, '');
  const parts = str.match(/((\.(\d+)\.?$)|(\.(\d+)\.))/g);
  const l = isFunction(t) ? t(cleaned) : cleaned;
  if (!l) return null;

  if (size(parts))
    return `${l} #${parts
      .map((item) => Number(item.replace(/\./g, '')) + 1)
      .join('-')}`;

  return l;
};

const mergeUpdateResult = (xs) =>
  map(xs, (updateRecord) =>
    merge({}, updateRecord.prev, updateRecord.curr),
  );

const mapUniq = (xs, callback) =>
  compact(uniqWith(map(xs, callback), isEqual));

const mapCompact = (xs, callback) =>
  map(xs, callback).filter(
    (d) => isObject(d) && Object.keys(d).length,
  );

const reduceFlattenedObject = (xs, t) =>
  alpha(
    Object.entries(xs).reduce((acc, [k, v]) => {
      const l = getIndexKey(k, t);
      if (l) acc[l] = v;
      return acc;
    }, {}),
  );

class ChangelogReport {
  constructor(coll, id) {
    if (!coll)
      throw new Error('Report requires collection');
    if (!id) throw new Error('Report requires ObjectId');

    this.$collection = coll;
    this.$id = id;
  }

  get connection() {
    return mongoose.connection.db.collection(
      `${this.$collection}-changelog-v2`,
    );
  }

  get id() {
    return mongoose.Types.ObjectId(this.$id);
  }

  async getDistinctUsers() {
    return canSessionUserSeeUserNames()
      ? this.connection
          .aggregate([
            {
              $match: {
                reference: this.id,
              },
            },
            {
              $group: {
                _id: '$user',
              },
            },
            {
              $lookup: {
                from: USER_COLLECTION_NAME,
                localField: '_id',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
              },
            },
            {
              $project: {
                _id: 0,
                value: '$_id',
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
          .toArray()
      : [];
  }

  async getData(
    query,
    targets = [],
    translateLabelFunction = null,
  ) {
    const ADDITIONS = 'additions';
    const DELETIONS = 'deletions';
    const UPDATES = 'updates';
    const REQUIRED_KEYS = [ADDITIONS, DELETIONS, UPDATES];

    const paths = convertStringToArray(targets);
    const g = getUserGrant(this.$collection);

    const data = !isNil(get(g, 'fields'))
      ? await this.connection
          .aggregate([
            {
              $match: merge({}, query, {
                $or: castPathsToQueryForExistence(paths),
                reference: this.id,
              }),
            },
            {
              $group: {
                _id: {
                  d: {
                    $dateToString: {
                      date: '$date',
                      // to fix a previous bug with timestamping
                      // there had been millisecond latency because of how
                      // diff wrote to database
                      format: '%Y-%m-%dT%H:%M:%S.000+00:00',
                    },
                  },
                  u: '$user',
                },
                [ADDITIONS]: {
                  $addToSet: '$added',
                },
                [DELETIONS]: {
                  $addToSet: '$deleted',
                },
                [UPDATES]: {
                  $addToSet: {
                    prev: '$previous',
                    curr: '$updated',
                  },
                },
              },
            },
            {
              $lookup: {
                from: USER_COLLECTION_NAME,
                localField: '_id.u',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                [ADDITIONS]: 1,
                [DELETIONS]: 1,
                [UPDATES]: 1,
                date: '$_id.d',
                user: canSessionUserSeeUserNames()
                  ? {
                      $concat: [
                        '$user.firstName',
                        ' ',
                        '$user.lastName',
                      ],
                    }
                  : 'Anonymous',
              },
            },
            {
              $match: {
                $or: [
                  isNotEmpty(ADDITIONS),
                  isNotEmpty(DELETIONS),
                  isNotEmpty(UPDATES),
                ],
              },
            },
            {
              $sort: {
                date: -1,
              },
            },
          ])
          .toArray()
      : [];

    return mapUniq(
      map(data, ({ updates, ...row }) => ({
        updates: mergeUpdateResult(updates),
        ...row,
      })),
      (item) => {
        const copy = { ...item };

        const compare = (a, b) => isEqual(copy[a], copy[b]);
        const pull = (k) => delete copy[k];

        const format = (xs) =>
          mapCompact(xs, (d) =>
            reduceFlattenedObject(
              Redact.flattenAndReduceByFields(
                pick(d, paths),
                g,
                {
                  keepFlat: true,
                  includeConditionalGlobs: false,
                },
              ),
              translateLabelFunction,
            ),
          );

        REQUIRED_KEYS.forEach((k) => {
          const r = format(item[k]);
          if (!size(r)) pull(k);
          else copy[k] = r;
        });

        if (compare(ADDITIONS, DELETIONS)) {
          pull(ADDITIONS);
          pull(DELETIONS);
        }

        if (compare(ADDITIONS, UPDATES)) pull(ADDITIONS);
        if (compare(DELETIONS, UPDATES)) pull(DELETIONS);

        return size(Object.keys(pick(copy, REQUIRED_KEYS)))
          ? copy
          : null;
      },
    );
  }
}

module.exports = ChangelogReport;

ChangelogReport.$internals = {
  castPathsToQueryForExistence,
  convertStringToArray,
  getIndexKey,
  reduceFlattenedObject,
};
