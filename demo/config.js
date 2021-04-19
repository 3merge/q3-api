const Q3 = require('q3-api');
const messages = require('./messages.json');

require('dotenv').config();

// force production app
process.env.NODE_ENV = 'production';

module.exports = {
  connect: () =>
    new Promise((resolve) => {
      require('./models');

      require('./setup').then(() => {
        resolve(
          Q3.config({
            messages,
            location: __dirname,
          }).connect(),
        );
      });
    }),
};
