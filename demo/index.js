const Q3 = require('q3-api');
const config = require('./config');
const { Character } = require('./models');

config
  .connect()
  // .then(() =>
  //   Character.initializeFuzzySearching().then(() => {
  //     console.log('DONE');
  //   }),
  // )
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e);
  });

module.exports = Q3.$app;
