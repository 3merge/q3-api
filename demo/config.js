const Q3 = require('q3-api');
const messages = require('./messages.json');
const ac = require('./q3-access.json');
require('dotenv').config();
require('./models');

module.exports = Q3.config({
  messages,
  location: __dirname,
  chores: {
    from: 'support@3merge.ca',
    strategy: 'Mailgun',
  },
})
  .protect(ac)
  .routes();
