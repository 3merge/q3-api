/* eslint-disable no-param-reassign, func-names */
const {
  pick,
  get,
  isNumber,
  isUndefined,
} = require('lodash');
const { seedChangelog } = require('./utils');

const increment = (v) => (isNumber(v) ? v + 1 : 0);

const isParent = (obj) => {
  try {
    return typeof obj.parent === 'function'
      ? obj.parent()._id.equals(obj._id)
      : true;
  } catch (e) {
    return true;
  }
};

module.exports = (schema) => {
  schema.pre('save', async function copyQ3UserData() {
    if (!isParent(this)) return;
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
