const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const autopopulate = require('mongoose-autopopulate');
const paginate = require('mongoose-paginate-v2');
const plugins = require('../plugins');

// replace this ...
require('mongoose-type-email');
require('mongoose-type-phone');
require('mongoose-type-url');

mongoose.pluralize(null);
mongoose.set('useEnsureIndex', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

plugins(mongoose);
mongoose.plugin(unique);
mongoose.plugin(autopopulate);
mongoose.plugin(paginate);

module.exports = mongoose;
