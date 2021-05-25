/* eslint-disable no-param-reassign, func-names */
const { pick, get, invoke } = require('lodash');
const { getFromChangelog } = require('./utils');

module.exports = (schema) => {
  schema.methods.getHistory = async function () {
    return getFromChangelog(
      get(this, 'constructor.collection.collectionName'),
      {
        date: { $exists: true },
        reference: this._id,
      },
    );
  };

  schema.pre('save', function copyQ3UserData() {
    if (invoke(this, 'parent')) return;

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
