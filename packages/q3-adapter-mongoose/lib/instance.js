const context = require('q3-core-session/lib/plugin');
const accessControl = require('q3-core-access/lib/plugin');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals-v2');
const changelog = require('q3-plugin-changelog');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const {
  autopopulate,
  cleanAutopopulateRefs,
  ExtendedReference,
} = require('q3-plugin-extref');
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
    schema.add(Files);
    schema.add(Notes);
  }
});

mongoose.plugin(accessControl);
mongoose.plugin(changelog);

module.exports = mongoose;
