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
          await insertIntoChangelog(
            get(Model, 'collection.collectionName'),
            get(args, 'documentKey._id'),
            reduceByKeyMatch(args.fullDocument, changelog),
            get(args, 'fullDocument.lastModifiedBy'),
          );
        })
        .on('error', () => {
          // noop
        });
    });
};
