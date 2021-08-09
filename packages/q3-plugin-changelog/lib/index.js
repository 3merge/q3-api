/* eslint-disable no-param-reassign, func-names */
const { pick, get, invoke, isNumber } = require('lodash');
const {
  getFromChangelog,
  getChangelogCollection,
} = require('./utils');

const increment = (v) => (isNumber(v) ? v + 1 : 0);

module.exports = (schema) => {
  schema.statics.getHistory = async function (args) {
    return getFromChangelog(
      get(this, 'collection.collectionName'),
      args,
    );
  };

  schema.methods.getHistory = async function (args) {
    return getFromChangelog(
      get(this, 'constructor.collection.collectionName'),
      {
        ...args,
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

    this.set(
      'changelog',
      increment(this.get('changelog')),
      {
        strict: false,
      },
    );
  });
};
