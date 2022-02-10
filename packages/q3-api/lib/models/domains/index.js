const mongoose = require('mongoose');
const { MODEL_NAMES } = require('../../constants');

module.exports = mongoose.model(
  MODEL_NAMES.DOMAINS,
  require('./schema'),
);
