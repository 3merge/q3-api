const req = require('request-context');
const accessControl = require('q3-schema-permissions/lib/plugin');
const Notes = require('q3-schema-notes');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const population = require('mongoose-field-populate');
const Files = require('../models/files');
const { MODEL_NAMES } = require('../constants');

require('q3-schema-types');

mongoose.pluralize(null);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.plugin(population);
mongoose.plugin(locking);

mongoose.plugin(dedupe, {
  options: {
    active: true,
  },
});

mongoose.plugin((schema) => {
  if (schema.options.uploads) schema.add(Notes);
  if (schema.options.uploads) schema.add(Files);
});

mongoose.plugin(accessControl, {
  getUser: () => req.get('q3-session:user'),
  lookup: MODEL_NAMES.PERMISSIONS,
});

module.exports = mongoose;
