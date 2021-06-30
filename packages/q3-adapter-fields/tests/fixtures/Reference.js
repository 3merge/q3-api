const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    max: 255,
  },
});

module.exports = mongoose.model('references', Schema);
