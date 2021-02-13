const { get, pick } = require('lodash');
const mongoose = require('mongoose');

const isUpdateOp = (resp) =>
  resp.operationType === 'update';

const getUpdatedFields = (resp) =>
  get(resp, 'updateDescription.updatedFields');

const prefixCollectionName = (name) =>
  `${name}-patch-history`;

const insertIntoChangelog = (collectionName, op) => {
  try {
    return mongoose.connection.db
      .collection(prefixCollectionName(collectionName))
      .insertOne(op);
  } catch (e) {
    return null;
  }
};

const getFromChangelog = (collectionName, op = {}) => {
  try {
    return new Promise((resolve, reject) =>
      mongoose.connection.db
        .collection(prefixCollectionName(collectionName))
        .find(op)
        .sort({ modifiedOn: -1 })
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        }),
    );
  } catch (e) {
    return null;
  }
};

Object.values(mongoose.models).forEach((Model) => {
  if (Model.schema.get('changelog'))
    Model.watch()
      .on('change', async (args) => {
        if (isUpdateOp(args))
          await insertIntoChangelog(
            Model.collection.collectionName,
            pick(
              getUpdatedFields(args),
              Model.getChangelogProperties(),
            ),
          );
      })
      .on('error', () => {
        // noop
      });
});

module.exports = {
  isUpdateOp,
  getUpdatedFields,
  getFromChangelog,
};
