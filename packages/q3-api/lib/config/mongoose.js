const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');

mongoose.set('useEnsureIndex', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.plugin(unique);

module.exports = mongoose;
