const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    searchable: true,
  },
  description: {
    type: String,
    searchable: true,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-articles', Schema);
