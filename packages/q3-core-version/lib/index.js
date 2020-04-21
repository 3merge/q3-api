const mongoose = require('mongoose');
const { invoke, pick, set } = require('lodash');
const {
  insertToPatchHistory,
  getFromPatchHistory,
  getUserMeta,
  getCollectionName,
  hasKeys,
} = require('./helpers');

const removeSensitiveProperties = (a) =>
  a.filter(
    (path) =>
      ![
        '_id',
        'id',
        '__v',
        '__t',
        'code',
        'secret',
        'password',
        'transaction',
      ].includes(path),
  );

module.exports = (schema, instance) => {
  schema.add({
    lastModifiedBy: mongoose.SchemaTypes.Mixed,
  });

  schema.pre('save', async function markModified() {
    const modifiedBy = getUserMeta(this);
    const paths = invoke(this, 'modifiedPaths');

    const modified = pick(
      this.toJSON(),
      removeSensitiveProperties(paths),
    );

    set(this, '$locals.patch', {
      /**
       * @NOTE
       * Ref to q3-core-session.
       * When enabled, it injects variables into __$q3.
       */
      modifiedOn: new Date().toISOString(),
      modified,
      modifiedBy,
    });

    if (
      !this.isNew &&
      hasKeys(modifiedBy) &&
      hasKeys(modified)
    ) {
      this.lastModifiedBy = modifiedBy;

      await insertToPatchHistory(
        instance,
        getCollectionName(this),
        this.$locals.patch,
      );
    }
  });

  // eslint-disable-next-line
  schema.methods.getHistory = async function () {
    return getFromPatchHistory(
      instance,
      getCollectionName(this),
    );
  };
};
