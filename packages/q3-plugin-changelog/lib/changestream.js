const flat = require('flat');
const mongoose = require('mongoose');
const {
  isUpdateOp,
  insertIntoChangelog,
  someMatch,
} = require('./utils');

Object.values(mongoose.models).forEach((Model) => {
  if (Model.schema.get('changelog'))
    Model.watch({
      fullDocument: 'updateLookup',
    })
      .on('change', async (args) => {
        const changelog = Model.getChangelogProperties();

        if (isUpdateOp(args) && changelog)
          await insertIntoChangelog(
            Model.collection.collectionName,
            args.documentKey._id,
            Object.entries(flat(args.fullDocument)).reduce(
              (acc, [key, value]) => {
                if (someMatch(changelog, key))
                  acc[key] = value;
                return acc;
              },
              {},
            ),
          );
      })
      .on('error', () => {
        // noop
      });
});
