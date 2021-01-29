require('./models');
const Q3 = require('q3-api');

module.exports = Q3.config({
  location: __dirname,
  // for testing purposes only..
  onCors: () => true,
  purgeSession: ({ USER }) => ({
    USER: {
      firstName: USER.firstName,
      lastName: USER.lastName,
    },
  }),
}).routes();
