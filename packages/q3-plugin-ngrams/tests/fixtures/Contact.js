const mongoose = require('mongoose');
const NGramsMongoosePlugin = require('../../lib');

const Schema = new mongoose.Schema({
  firstName: {
    type: String,
    searchable: true,
    minGramSize: 2,
    maxGramSize: 4,
  },
  lastName: {
    type: String,
    searchable: true,
    minGramSize: 2,
    maxGramSize: 4,
  },
  email: {
    type: String,
    searchable: true,
    minGramSize: 3,
    maxGramSize: 5,
  },
  tel: {
    type: String,
    searchable: true,
    minGramSize: 3,
    maxGramSize: 4,
  },
});

Schema.plugin(NGramsMongoosePlugin);
module.exports = mongoose.model('ngram-contacts', Schema);
