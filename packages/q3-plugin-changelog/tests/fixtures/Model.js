const mongoose = require('mongoose');
const plugin = require('../../lib');

const Publication = new mongoose.Schema({
  name: String,
});

const Topic = new mongoose.Schema({
  name: String,
  publications: [Publication],
});

const Schema = new mongoose.Schema(
  {
    title: { type: String },
    description: String,
    topics: [Topic],
  },
  {
    changelog: ['title', 'topics.$.name'],
    timestamps: true,
  },
);

Schema.pre('save', function stubSessionDetails() {
  this.__$q3 = {
    USER: {
      firstName: 'Jon',
      lastName: 'Doe',
    },
  };
});

Schema.plugin(plugin);

module.exports = mongoose.model(
  'testing-changelog',
  Schema,
);
