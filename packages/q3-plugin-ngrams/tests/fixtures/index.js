const mongoose = require('mongoose');

// globally register the plugin
mongoose.plugin(require('../../lib'));

const Article = require('./Article');
const Blog = require('./Blog');
const articleJson = require('./article.json');
const Contact = require('./Contact');
const contactJson = require('./contact.json');

module.exports = {
  Article,
  Blog,
  Contact,

  seed: async () => {
    await Promise.all([
      Article.insertMany(articleJson),
      Contact.insertMany(contactJson),
    ]);

    await Promise.all([
      Article.createTextIndex(),
      Contact.createTextIndex(),
    ]);

    return Promise.all([
      Article.initializeFuzzySearching(),
      Contact.initializeFuzzySearching(),
    ]);
  },
};
