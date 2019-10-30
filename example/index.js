require('./models');
const Q3 = require('q3-api');
const walker = require('q3-core-walker');

Q3.config({
  authorization: {
    roles: ['Assassin', 'King', 'Badass'],
    conditions: ['isVeteran'],
  },
});

Q3.routes(walker(__dirname));

Q3.connect().then(() => {
  // noop
});
