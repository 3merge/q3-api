require('./models');
const Q3 = require('q3-api');

Q3.config({
  authorization: {
    roles: ['Assassin', 'King', 'Badass'],
    conditions: ['isVeteran'],
  },
});

Q3.connect().then(() => {
  // noop
});
