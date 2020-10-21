const mongoose = require('mongoose');
const Schema = require('./schema');

module.exports = mongoose.model(
  'q3-plugin-scheduler',
  Schema,
);
