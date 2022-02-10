const mongoose = require('mongoose');
const cluster = require('cluster');
const { get } = require('lodash');
const { insertIntoChangelog } = require('./utils');

const shouldRunChangelog = (Model) => {
  try {
    return !(
      Model.baseModelName ||
      [
        'queues',
        'q3-api-notifications',
        'notifications',
      ].includes(Model.modelName) ||
      // allows you to turn it off for specific collections
      Model.schema.get('disableChangelog')
    );
  } catch (e) {
    return false;
  }
};

module.exports = () => {
  if (cluster.isMaster)
    Object.values(mongoose.models).forEach((Model) => {
      if (!shouldRunChangelog(Model)) return;

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
