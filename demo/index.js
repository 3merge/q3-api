const Q3 = require('q3-api');
const config = require('./config');

config.connect().catch((e) => {
  // eslint-disable-next-line
  console.log(e);
});

module.exports = Q3.$app;
