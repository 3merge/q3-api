const mongoose = require('mongoose');
const { STRATEGIES } = require('./constants');

module.exports = new mongoose.Schema({
  secret: {
    type: String,
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
