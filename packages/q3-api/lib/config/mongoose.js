const context = require('q3-core-session/lib/plugin');
const accessControl = require('q3-core-access/lib/plugin');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals-v2');
const Notes = require('q3-schema-notes');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const {
  autopopulate,
  cleanAutopopulateRefs,
  ExtendedReference,
} = require('q3-plugin-extref');
const versionControl = require('q3-plugin-changelog');
const Files = require('../models/files');
const { MODEL_NAMES } = require('../constants');

require('q3-schema-types');

// for backwards compatibility
mongoose.set('strictQuery', false);

mongoose.pluralize(null);
mongoose.plugin(context);
mongoose.plugin(autopopulate);
mongoose.plugin(locking);

mongoose.plugin(dedupe, {
  options: {
    active: true,
  },
});

mongoose.plugin((schema) => {
  if (schema.options.withVirtuals)
    mongoose.plugin(mongooseLeanVirtuals);

  if (schema.options.extends)
    ExtendedReference.plugin(
      schema,
      schema.options.extends,
    );

  if (schema.options.autopopulates)
    schema.plugin(
      cleanAutopopulateRefs,
      schema.options.autopopulates,
    );

  if (schema.options.restify) {
    // most packages assume the existence of this plugin
    schema.set('enableArchive', true);
    schema.set('enableOwnership', true);
    schema.add(Files);
    schema.add(Notes);
  }
});

mongoose.plugin(accessControl, {
  userCollectionName: MODEL_NAMES.USERS,
});

mongoose.plugin(versionControl);
module.exports = mongoose;
