const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const plugins = require('../plugins');

require('q3-schema-types');

mongoose.pluralize(null);
mongoose.set('useEnsureIndex', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

plugins(mongoose);
mongoose.plugin(unique);

module.exports = mongoose;
