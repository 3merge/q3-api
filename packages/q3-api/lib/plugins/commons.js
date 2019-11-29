/* eslint-disable func-names, no-param-reassign */
const Notes = require('q3-schema-notes');
const Files = require('../models/files');

const plugin = (schema) => {
  if (schema.options.uploads) {
    schema.add(Notes);
  }

  if (schema.options.uploads) {
    schema.add(Files);
  }

  return schema;
};

module.exports = plugin;
