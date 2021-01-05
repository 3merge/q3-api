const mongoose = require('mongoose');
const Article = require('./Article');

const Schema = new mongoose.Schema({
  website: {
    type: String,
    gram: true,
  },
});

module.exports = Article.discriminator(
  'ngram-blogs',
  Schema,
);
