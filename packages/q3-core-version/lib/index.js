const mongoose = require('mongoose');
const { invoke, pick, set } = require('lodash');
const {
  insertToPatchHistory,
  getFromPatchHistory,
  getUserMeta,
  getCollectionName,
  hasKeys,
  diff,
} = require('./helpers');

const removeSensitiveProperties = (a) =>
  a.filter(
    (path) =>
      ![
        '_id',
        '__v',
        '__t',
        '__$q3',
        'id',
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
    const original = await this.constructor
      .findById(this._id)
      .lean()
      .exec();

    const modifiedBy = getUserMeta(this);
    const paths = invoke(this, 'modifiedPaths');

    const modified = pick(
      diff(this.toJSON(), original),
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
