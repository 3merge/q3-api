const mongoose = require('mongoose');
const cluster = require('cluster');
const { get } = require('lodash');
const path = require('path');
const fs = require('fs');
const {
  insertIntoChangelog,
  reduceByKeyMatch,
} = require('./utils');

/**
 * @TODO
 * Refactor with the same code block from q3-core-access.
 */
const getSeedDataFromPath = (dir = '') => {
  const joinPath = (relativity) =>
    path.join(dir, `${relativity}/q3-changelog.json`);

  const loadFrom = (filepath) =>
    // eslint-disable-next-line
    fs.existsSync(filepath) ? require(filepath) : null;

  return Array.from({ length: 3 }).reduce(
    (acc, curr, i) =>
      loadFrom(
        joinPath(
          Array.from({ length: i })
            .map(() => '.')
            .join(''),
        ),
      ) || acc,
    {},
  );
};

module.exports = (src) => {
  if (cluster.isMaster)
    Object.values(mongoose.models).forEach((Model) => {
      const coll = get(Model, 'collection.collectionName');
      const json = getSeedDataFromPath(src);
      let changelog = get(json, coll);

      if (!changelog)
        changelog = Model.getChangelogProperties
          ? Model.getChangelogProperties()
          : null;

      // do not track discriminators
      if (!changelog || Model.baseModelName) return;

      Model.watch(
        [
          {
            $match: {
              operationType: {
                $in: ['insert', 'update'],
              },
            },
          },
          {
            $project: {
              documentKey: 1,
              fullDocument: 1,
              updateDescription: 1,
            },
          },
        ],
        {
          fullDocument: 'updateLookup',
        },
      )
        .on('change', async (args) =>
          insertIntoChangelog(
            get(Model, 'collection.collectionName'),
            get(args, 'documentKey._id'),
            reduceByKeyMatch(
              get(args, 'fullDocument'),
              changelog,
            ),
          ),
        )
        .on('error', () => {
          // noop
        });
    });
};
