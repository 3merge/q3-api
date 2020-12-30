const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  firstName: {
    type: String,
    gram: 2,
  },
  lastName: {
    type: String,
    gram: 2,
  },
  email: {
    type: String,
    gram: 3,
  },
  tel: {
    type: String,
    gram: 3,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-contacts', Schema);
