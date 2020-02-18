const { invoke, pick, set } = require('lodash');
const {
  insertToPatchHistory,
  getFromPatchHistory,
  getUserMeta,
  getCollectionName,
} = require('./helpers');

module.exports = (schema, instance) => {
  schema.pre('save', async function markModified() {
    set(this, '$locals.patch', {
      /**
       * @NOTE
       * Ref to q3-core-session.
       * When enabled, it injects variables into __$q3.
       */
      user: getUserMeta(this),
      modified: pick(
        this.toJSON(),
        invoke(this, 'modifiedPaths'),
      ),
    });

    if (!this.isNew)
      await insertToPatchHistory(
        instance,
        getCollectionName(this),
        this.$locals.patch,
      );
  });

  // eslint-disable-next-line
  schema.methods.getHistory = async function () {
    return getFromPatchHistory(
      instance,
      getCollectionName(this),
    );
  };
};
