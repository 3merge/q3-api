/* eslint-disable no-param-reassign, func-names */
const { pick, get, size, map, invoke } = require('lodash');
const { getFromChangelog } = require('./utils');

module.exports = (schema) => {
  schema.statics.getChangelogProperties = function () {
    const props = get(this, 'schema.options.changelog');
    return size(props) ? props : null;
  };

  schema.methods.getHistory = async function () {
    return map(
      await getFromChangelog(
        get(this, 'constructor.collection.collectionName'),
        {
          reference: this._id,
          nextgen: true,
          'snapshot.updatedAt': { $exists: true },
        },
      ),
      'snapshot',
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
