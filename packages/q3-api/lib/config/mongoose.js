const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const autopopulate = require('mongoose-autopopulate');
const paginate = require('mongoose-paginate-v2');

mongoose.pluralize(null);
mongoose.set('useEnsureIndex', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.plugin(unique);
mongoose.plugin(autopopulate);
mongoose.plugin(paginate);

module.exports = mongoose;
