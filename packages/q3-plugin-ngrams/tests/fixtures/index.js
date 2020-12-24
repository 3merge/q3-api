const Article = require('./Article');
const articleJson = require('./article.json');
const Contact = require('./Contact');
const contactJson = require('./contact.json');

module.exports = {
  Article,
  Contact,

  seed: async () => {
    await Promise.all([
      Article.insertMany(articleJson),
      Contact.insertMany(contactJson),
    ]);

    return Promise.all([
      Article.initializeFuzzySearching(),
      Contact.initializeFuzzySearching(),
    ]);
  },
};
