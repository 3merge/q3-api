const context = require('q3-core-session/lib/plugin');
const accessControl = require('q3-core-access/lib/plugin');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals-v2');
const Notes = require('q3-schema-notes');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const { autopopulate } = require('mongoose-field-populate');
const version = require('q3-core-version');
const Files = require('../models/files');

require('q3-schema-types');

mongoose.pluralize(null);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.plugin(context);
mongoose.plugin(autopopulate);
mongoose.plugin(locking);

mongoose.plugin(dedupe, {
  options: {
    active: true,
  },
});

mongoose.plugin((schema) => {
  if (schema.options.withNotes) schema.add(Notes);
  if (schema.options.withUploads) schema.add(Files);

  if (schema.options.withVirtuals)
    mongoose.plugin(mongooseLeanVirtuals);

  if (schema.options.restify)
    schema.plugin(version, mongoose);
});

mongoose.plugin(accessControl);

module.exports = mongoose;
