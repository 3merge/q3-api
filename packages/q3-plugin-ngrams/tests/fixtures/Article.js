const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    gram: true,
  },
  description: {
    type: String,
    gram: true,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-articles', Schema);
