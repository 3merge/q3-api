const mongoose = require('mongoose');

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

module.exports = mongoose.model('ngram-contacts', Schema);
