const flat = require('flat');
const { pick, get, first, split } = require('lodash');
const mongoose = require('mongoose');

module.exports = (schema) => {
  // enable changestream
  schema.set('changelog', true);

  schema.add({
    lastModifiedBy: mongoose.SchemaTypes.Mixed,
  });

  schema.statics.getChangelogProperties = function () {
    return Object.keys(flat(this.schema.obj))
      .filter((item) => item.endsWith('changelog'))
      .map((item) => first(split(item, '.changelog')));
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
