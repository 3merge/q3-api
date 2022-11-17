const mongoose = require('mongoose');
require('./decorator');

module.exports = mongoose.model(
  'system-counters',
  require('./schema'),
);
