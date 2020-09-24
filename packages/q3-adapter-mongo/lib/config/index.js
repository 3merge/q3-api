const context = require('q3-core-session/lib/plugin');
const accessControl = require('q3-core-access/lib/plugin');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals-v2');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const { autopopulate } = require('mongoose-field-populate');

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

  if (schema.options.restify) {
    // most packages assume the existence of this plugin
    schema.set('enableArchive', true);
    schema.set('enableOwnership', true);
    schema.set('versionHistoryWatchers', true);

    // will eventually replace this
    // eslint-disable-next-line
    schema.extend = schema.plugin.bind(schema);
  }
});

mongoose.plugin(accessControl);
