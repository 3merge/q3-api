const mongoose = require('mongoose');
const { translate } = require('../config/i18next');
const expection = require('../errors');

mongoose.plugin((schema) => {
  // eslint-disable-next-line
  schema.statics.findStrictly = async function(id) {
    const doc = await this.findById(id).exec();
    if (!doc)
      expection('ResourceNotFound').throw(
        translate('messages:missingResource'),
      );

    return doc;
  };

  Object.assign(schema.options, {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });
});
