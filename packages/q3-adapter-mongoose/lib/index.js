const { ExtendedReference } = require('q3-plugin-extref');
const mongoose = require('mongoose');
const { capitalize, get } = require('lodash');
const instance = require('./instance');
const Subscribe = require('./subscribe');

module.exports = {
  mongoose: instance,
  Subscribe,

  getSchemaType(type) {
    return get(
      mongoose,
      `Schema.Types.${capitalize(type)}`,
    );
  },

  makeExtendedReference(collection) {
    return new ExtendedReference(collection);
  },

  model(name) {
    if (!(name in mongoose.models))
      throw new Error('Unknown model');

    return get(mongoose.models, name);
  },

  setModel(name, Schema) {
    return mongoose.model(name, Schema);
  },
};
