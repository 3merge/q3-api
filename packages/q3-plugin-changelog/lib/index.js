/* eslint-disable no-param-reassign, func-names */
const { pick, get, size, map } = require('lodash');
const mongoose = require('mongoose');
const { getFromChangelog } = require('./utils');

module.exports = (schema) => {
  schema.add({
    lastModifiedBy: mongoose.SchemaTypes.Mixed,
  });

  schema.statics.getChangelogProperties = function () {
    const props = get(this, 'schema.options.changelog');
    return size(props)
      ? [
          ...props,
          'lastModifiedBy.firstName',
          'lastModifiedBy.lastName',
          'updatedAt',
        ]
      : null;
  };

  schema.methods.getHistory = async function () {
    return map(
      await getFromChangelog(
        get(this, 'constructor.collection.collectionName'),
        { reference: this._id, nextgen: true },
      ),
      'snapshot',
    );
  };

  schema.pre('save', function copyQ3UserData() {
    this.set(
      'lastModifiedBy',
      pick(get(this, '__$q3.USER', {}), [
        'id',
        'firstName',
        'lastName',
        'email',
      ]),
      {
        strict: false,
      },
    );
  });
};
