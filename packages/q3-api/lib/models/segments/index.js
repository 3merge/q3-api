require('./decorators');
const mongoose = require('mongoose');
const { MODEL_NAMES } = require('../../constants');
const Schema = require('./schema');

module.exports = mongoose.model(
  MODEL_NAMES.SEGMENTS,
  Schema,
);
