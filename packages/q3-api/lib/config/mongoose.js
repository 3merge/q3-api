const req = require('request-context');
const accessControl = require('q3-schema-permissions/lib/plugin');
const Notes = require('q3-schema-notes');
const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const diff = require('mongoose-diff-history/diffHistory');
const locking = require('mongoose-field-lock');
const population = require('mongoose-field-populate');
const Files = require('../models/files');

require('q3-schema-types');

mongoose.pluralize(null);
mongoose.set('useEnsureIndex', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.plugin(accessControl, {
  getUser: () => req.get('q3-session:user'),
  getGrant: () => req.get('q3-session:grant'),
});

mongoose.plugin(diff.plugin);
mongoose.plugin(locking);
mongoose.plugin(population);
mongoose.plugin(unique);

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

module.exports = mongoose;
