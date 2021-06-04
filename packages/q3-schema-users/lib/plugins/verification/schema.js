const mongoose = require('mongoose');
const { createHash } = require('../../helpers');
const { STRATEGIES } = require('./constants');

module.exports = new mongoose.Schema({
  secret: {
    type: String,
    set: createHash,
  },
  strategy: {
    type: String,
    enum: STRATEGIES,
    required: true,
  },
  state: {
    default: false,
    type: Boolean,
  },
});
