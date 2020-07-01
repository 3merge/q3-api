require('./models');
const Q3 = require('q3-api');
const access = require('./q3-access.json');

module.exports = Q3.config({
  location: __dirname,
  // for testing purposes only..
  onCors: () => true,
})
  .protect(access)
  .routes();
