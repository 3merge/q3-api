const mongoose = require('mongoose');

module.exports = mongoose.model(
  'system-counters',
  require('./schema'),
);
