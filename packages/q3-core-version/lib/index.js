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

const hasWatchers = (options) =>
  options &&
  options.versionHistoryWatchers &&
  options.versionHistoryWatchers.length;

module.exports = (schema, instance) => {
  schema.add({
    lastModifiedBy: mongoose.SchemaTypes.Mixed,
  });

  schema.pre('save', async function markModified() {
    if (
      !this.constructor ||
      !this.constructor.findById ||
      !hasWatchers(schema.options) ||
      !this.$locals.$op
    )
      return;

    const original = await this.constructor
      .findById(this._id)
      .exec();

    if (!original) return;

    const modifiedBy = getUserMeta(this);
    const modified = diff(
      this.toJSON(),
      original.toJSON(),
      schema.options.versionHistoryWatchers,
    );

    set(this, '$locals.patch', {
      /**
       * @NOTE
       * Ref to q3-core-session.
       * When enabled, it injects variables into __$q3.
       */
      ref: this._id,
      modifiedOn: new Date().toISOString(),
      target: this.$locals.$target,
      op: this.$locals.$op,
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
      this.$locals.$op = 'Update';
      this.$locals.$target = 'baseSchema';
      return this.set(body);
    } catch (e) {
      return this.set(body);
    }
  };

  // eslint-disable-next-line
  schema.methods.snapshotChangeOnSubdocument = function (field, op) {
    try {
      this.$locals.$op = op;
      this.$locals.$target = field;
      return this;
    } catch (e) {
      return this;
    }
  };

  // eslint-disable-next-line
  schema.methods.snapshotInsertSubdocument = function (field) {
    return this.snapshotChangeOnSubdocument(
      field,
      'Create',
    );
  };

  // eslint-disable-next-line
  schema.methods.snapshotUpdateSubdocument = function (field) {
    return this.snapshotChangeOnSubdocument(
      field,
      'Update',
    );
  };

  // eslint-disable-next-line
  schema.methods.snapshotDeleteSubdocument = function (field) {
    return this.snapshotChangeOnSubdocument(
      field,
      'Delete',
    );
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
