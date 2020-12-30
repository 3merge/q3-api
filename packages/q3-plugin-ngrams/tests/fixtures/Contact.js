const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  firstName: {
    type: String,
    gram: true,
  },
  lastName: {
    type: String,
    gram: true,
  },
  email: {
    type: String,
    gram: true,
  },
  tel: {
    type: String,
    gram: true,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-contacts', Schema);
