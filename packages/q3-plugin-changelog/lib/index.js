/* eslint-disable no-param-reassign, func-names */
const {
  pick,
  get,
  invoke,
  isNumber,
  isUndefined,
} = require('lodash');
const mongoose = require('mongoose');
const {
  getFromChangelog,
  seedChangelog,
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

  schema.pre('save', async function copyQ3UserData() {
    if (invoke(this, 'parent')) return;
    const currentChangeLogValue = this.get('changelog');

    if (isUndefined(currentChangeLogValue) && !this.isNew)
      await seedChangelog(
        get(this, 'constructor.collection.collectionName'),
        this._id,
      );

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
      increment(currentChangeLogValue),
      {
        strict: false,
      },
    );
  });
};
