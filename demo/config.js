const Q3 = require('q3-api');
const messages = require('./messages.json');

require('dotenv').config();
require('./models');

// force production app
process.env.NODE_ENV = 'production';

module.exports = Q3.config({
  messages,
  location: __dirname,
}).routes();
