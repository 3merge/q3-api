const mongoose = require('mongoose');
const ActivitySchema = require('./Activity');

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
  activities: [ActivitySchema],
});

module.exports = mongoose.model('ngram-contacts', Schema);
