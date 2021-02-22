const mongoose = require('mongoose');

const { get } = require('lodash');
const {
  insertIntoChangelog,
  reduceByKeyMatch,
} = require('./utils');

module.exports = () => {
  Object.values(mongoose.models).forEach((Model) => {
    const changelog = Model.getChangelogProperties();

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
