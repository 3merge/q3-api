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

      Model.watch({
        fullDocument: 'updateLookup',
      })
        .on('change', async (args) => {
          const getFromUpdatedDescription = (f) =>
            reduceByKeyMatch(
              get(args, `updateDescription.${f}`),
              changelog,
            );

          await insertIntoChangelog(
            get(Model, 'collection.collectionName'),
            get(args, 'documentKey._id'),
            {
              updatedFields: getFromUpdatedDescription(
                'updatedFields',
              ),
              removedFields: getFromUpdatedDescription(
                'removedFields',
              ),
            },
            get(args, 'updateDescription.lastModifiedBy') ||
              get(args, 'fullDocument.lastModifiedBy'),
          );
        })
        .on('error', () => {
          // noop
        });
    });
};
