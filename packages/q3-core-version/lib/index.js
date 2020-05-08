const mongoose = require('mongoose');
const { set } = require('lodash');
const {
  insertToPatchHistory,
  getFromPatchHistory,
  getUserMeta,
  getCollectionName,
  hasKeys,
  diff,
} = require('./helpers');

module.exports = (schema, instance) => {
  schema.add({
    lastModifiedBy: mongoose.SchemaTypes.Mixed,
  });

  schema.pre('save', async function markModified() {
    if (this.isNew) return;

    const original = await this.constructor
      .findById(this._id)
      .exec();

    if (!original) return;

    const modifiedBy = getUserMeta(this);
    const modified = diff(
      this.$locals.$raw,
      original.toJSON(),
      [
        '*_id*',
        '*__v*',
        '*__t*',
        '__$q3',
        '*id*',
        'code',
        'secret',
        'password',
        'transaction',
        '*updatedAt*',
        '*createdBy*',
      ],
    );

    set(this, '$locals.patch', {
      /**
       * @NOTE
       * Ref to q3-core-session.
       * When enabled, it injects variables into __$q3.
       */
      ref: this._id,
      modifiedOn: new Date().toISOString(),
      modified,
      modifiedBy,
    });

    if (hasKeys(modifiedBy) && hasKeys(modified)) {
      this.lastModifiedBy = modifiedBy;

      await insertToPatchHistory(
        instance,
        getCollectionName(this),
        this.$locals.patch,
      );
    }
  });

  // eslint-disable-next-line
  schema.methods.snapshotChange = function (body) {
    try {
      this.$locals.$raw = body;
      return this.set(body);
    } catch (e) {
      return this.set(body);
    }
  };

  // eslint-disable-next-line
  schema.methods.snapshotChangeOnSubdocument = function (field, body) {
    try {
      if (!this.$locals.$raw) this.$locals.$raw = {};
      if (!this.$locals.$raw[field])
        this.$locals.$raw[field] = [];

      this.$locals.$raw[field].push(body);
      return this;
    } catch (e) {
      return this;
    }
  };

  // eslint-disable-next-line
  schema.methods.getHistory = async function () {
    return getFromPatchHistory(
      instance,
      getCollectionName(this),
      {
        ref: this._id,
      },
    );
  };
};
