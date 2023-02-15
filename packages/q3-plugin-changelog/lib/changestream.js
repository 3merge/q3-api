const mongoose = require('mongoose');
const cluster = require('cluster');
const { get, invoke } = require('lodash');
const { insertIntoChangelog } = require('./utils');

const isReadyToConnect = () => {
  try {
    return (
      cluster.isMaster &&
      mongoose.connection.readyState === 1
    );
  } catch (e) {
    return false;
  }
};

module.exports = () => {
  const blacklist = [
    'notifications',
    'q3-api-notifications',
    'queues',
    'segments',
    'system-counters',
  ];

  const checkBlacklist = (Model) => {
    try {
      return (
        // don't run on discriminators
        Model.baseModelName ||
        Model.schema.get('disableChangelog') ||
        blacklist.includes(Model.modelName)
      );
    } catch (e) {
      return false;
    }
  };

  if (isReadyToConnect())
    Object.values(mongoose.models).forEach((Model) => {
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
        .on('change', async (args) => {
          const collection = get(
            Model,
            'collection.collectionName',
          );

          if (!checkBlacklist(Model))
            await insertIntoChangelog(
              collection,
              get(args, 'documentKey._id'),
              get(args, 'fullDocument'),
            );

          await invoke(global, 'handleChangeStreamWorker', {
            ...args,
            collection,
          });
        })
        .on('error', () => {
          // noop
        });
    });
};
