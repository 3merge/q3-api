const mongoose = require('mongoose');

module.exports = mongoose.model(
  'emails',
  new mongoose.Schema({
    name: String,
    mjml: String,
  }),
);
