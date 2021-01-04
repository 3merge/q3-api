const mongoose = require('mongoose');
const meta = require('./Meta');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    gram: true,
  },
  description: {
    type: String,
    gram: true,
  },
  meta,
});

module.exports = mongoose.model('ngram-articles', Schema);
