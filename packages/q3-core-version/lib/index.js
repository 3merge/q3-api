const mongoose = require('mongoose');
const { pick, set, union } = require('lodash');
const {
  insertToPatchHistory,
  getFromPatchHistory,
  getUserMeta,
  getCollectionName,
  hasKeys,
  diff,
} = require('./helpers');

const hasWatchers = (options) =>
  options && options.versionHistoryWatchers;

const getSchemaPaths = (schema) => {
  let paths = [];

  if (schema.discriminators)
    paths = Object.values(schema.discriminators).flatMap(
      (s) => Object.keys(s.paths),
    );

  return union(paths, Object.keys(schema.paths));
};

module.exports = (schema, instance) => {
  const getCurrentVersion = (doc) =>
    doc.constructor
      .findById(doc._id)
      .select(getSchemaPaths(schema).join(' '))
      .lean()
      .exec();

  schema.add({
    lastModifiedBy: mongoose.SchemaTypes.Mixed,
  });

  schema.post('init', (doc) => {
    const selected = doc.toObject ? doc.toObject() : doc;
    const picked = pick(selected, getSchemaPaths(schema));
    set(doc, '$locals.$original', picked);
  });

  schema.pre('save', async function markModified() {
    if (
      !this.constructor ||
      !this.constructor.findById ||
      !hasWatchers(schema.options) ||
      !this.$locals.$op
    )
      return;

    const original =
      this.$locals.$original || (await getCurrentVersion());

    if (!original) return;

    const modifiedBy = getUserMeta(this);
    const modified = diff(
      this.toJSON(),
      original,
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

    if (hasKeys(modifiedBy)) {
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
  schema.methods.snapshotChangeOnSubdocument = function (
    field,
    op,
  ) {
    try {
      this.$locals.$op = op;
      this.$locals.$target = field;
      return this;
    } catch (e) {
      return this;
    }
  };

  // eslint-disable-next-line
  schema.methods.snapshotInsertSubdocument = function (
    field,
  ) {
    return this.snapshotChangeOnSubdocument(
      field,
      'Create',
    );
  };

  // eslint-disable-next-line
  schema.methods.snapshotUpdateSubdocument = function (
    field,
  ) {
    return this.snapshotChangeOnSubdocument(
      field,
      'Update',
    );
  };

  // eslint-disable-next-line
  schema.methods.snapshotDeleteSubdocument = function (
    field,
  ) {
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
