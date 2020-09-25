const mongooseLeanVirtuals = require('mongoose-lean-virtuals-v2');
const mongoose = require('mongoose');
const dedupe = require('mongoose-dedupe');
const locking = require('mongoose-field-lock');
const { autopopulate } = require('mongoose-field-populate');

mongoose.pluralize(null);
mongoose.plugin(mongooseLeanVirtuals);
mongoose.plugin(autopopulate);
mongoose.plugin(locking);

mongoose.plugin(dedupe, {
  options: {
    active: true,
  },
});

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
