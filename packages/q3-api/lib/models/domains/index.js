const mongoose = require('mongoose');
const { MODEL_NAMES } = require('../../constants');

require('./decorators');
require('./middleware');

module.exports = mongoose.model(
  MODEL_NAMES.DOMAINS,
  require('./schema'),
);
