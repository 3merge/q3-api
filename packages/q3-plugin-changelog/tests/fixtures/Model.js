const mongoose = require('mongoose');
const plugin = require('../../lib');

const Topic = new mongoose.Schema({
  name: String,
});

const Schema = new mongoose.Schema(
  {
    title: { type: String },
    description: String,
    topics: [Topic],
  },
  {
    changelog: ['title', 'topics.$.name'],
  },
);

Schema.plugin(plugin);

module.exports = mongoose.model(
  'testing-changelog',
  Schema,
);
