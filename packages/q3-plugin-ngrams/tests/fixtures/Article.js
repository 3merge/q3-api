const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    searchable: true,
    minGramSize: 2,
    maxGramSize: 4,
  },
  description: {
    type: String,
    searchable: true,
    minGramSize: 4,
    maxGramSize: 6,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-articles', Schema);
