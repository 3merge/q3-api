const mongoose = require('mongoose');
const cluster = require('cluster');
const { get } = require('lodash');
const {
  insertIntoChangelog,
  reduceByKeyMatch,
} = require('./utils');

module.exports = () => {
  if (cluster.isMaster)
    Object.values(mongoose.models).forEach((Model) => {
      const changelog = Model.getChangelogProperties
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
