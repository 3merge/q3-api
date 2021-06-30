const mongoose = require('mongoose');
const { ExtendedReference } = require('q3-plugin-extref');
const plugin = require('../../lib');

const Schema = new mongoose.Schema({
  title: {
    required: true,
    type: String,
    max: 155,
  },
  description: {
    type: String,
  },
  age: {
    type: Number,
    min: 18,
    default: 0,
  },
  pronoun: {
    type: String,
    enum: ['Mr', 'Mrs', 'Ms'],
  },
  friend: new ExtendedReference('references')
    .on(['name'])
    .isRequired()
    .done(),
});

Schema.plugin(plugin);
module.exports = mongoose.model('tests', Schema);
