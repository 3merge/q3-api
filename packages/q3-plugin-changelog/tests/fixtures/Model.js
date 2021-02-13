const mongoose = require('mongoose');
const plugin = require('../../lib');

const Schema = new mongoose.Schema({
  title: { type: String, changelog: true },
  description: String,
});

Schema.plugin(plugin);

module.exports = mongoose.model(
  'testing-changelog',
  Schema,
);
