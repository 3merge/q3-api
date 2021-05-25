const mongoose = require('mongoose');
const cluster = require('cluster');
const { get } = require('lodash');
const { insertIntoChangelog } = require('./utils');

module.exports = () => {
  if (cluster.isMaster)
    Object.values(mongoose.models).forEach((Model) => {
      if (
        Model.baseModelName ||
        ['queues', 'q3-api-notifications'].includes(
          Model.modelName,
        )
      )
        return;

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
            get(args, 'fullDocument'),
          ),
        )
        .on('error', () => {
          // noop
        });
    });
};
