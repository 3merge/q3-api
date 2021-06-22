const mongoose = require('mongoose');
const { Schema, Plugins } = require('../../lib');
const userData = require('./data.json');

Plugins.verification(Schema, {
  MMS: {
    enable: true,
    enforce: true,
  },
});

const Model = mongoose.model('users', Schema);

exports.create = async () => Model.create(userData);
