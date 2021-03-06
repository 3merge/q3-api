const mongoose = require('mongoose');
const cluster = require('cluster');
const { get, uniq } = require('lodash');
const {
  findFileTraversingUpwards,
} = require('q3-schema-utils');
const {
  addMetaData,
  insertIntoChangelog,
  reduceByKeyMatch,
} = require('./utils');

module.exports = (src = __dirname) => {
  const json = findFileTraversingUpwards(
    src,
    'q3-changelog.json',
    {},
  );

  if (cluster.isMaster)
    Object.values(mongoose.models).forEach((Model) => {
      const coll = get(Model, 'collection.collectionName');
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
              uniq(addMetaData(changelog)),
            ),
          ),
        )
        .on('error', () => {
          // noop
        });
    });
};
