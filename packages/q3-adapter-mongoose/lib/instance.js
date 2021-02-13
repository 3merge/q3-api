const context = require('q3-core-session/lib/plugin');
const accessControl = require('q3-core-access/lib/plugin');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals-v2');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const {
  autopopulate,
  cleanAutopopulateRefs,
  ExtendedReference,
} = require('q3-plugin-extref');
const version = require('q3-core-version');
const Files = require('q3-schema-files');
const Notes = require('q3-schema-notes');

require('q3-schema-types');

mongoose.Types.ExtendedReference = ExtendedReference;

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
    schema.set('enableArchive', true);
    schema.set('enableOwnership', true);
    schema.set('versionHistoryWatchers', true);

    schema.plugin(version, mongoose);
    schema.add(Files);
    schema.add(Notes);
  }
});

mongoose.plugin(accessControl);
module.exports = mongoose;
