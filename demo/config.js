const Q3 = require('q3-api');
const access = require('./access.json');
const messages = require('./messages.json');
require('./models');

process.env.CONNECTION = 'mongodb://localhost:27017/q3';
process.env.PORT = 9000;

module.exports = Q3.config({
  messages,
  location: __dirname,
  chores: {
    from: 'support@3merge.ca',
    strategy: 'Mailgun',
  },
})
  .protect(access)
  .routes();
