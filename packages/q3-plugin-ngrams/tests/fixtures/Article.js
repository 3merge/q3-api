const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    gram: 2,
  },
  description: {
    type: String,
    gram: 4,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-articles', Schema);
