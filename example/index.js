require('./models');
const Q3 = require('q3-api');
const mailer = require('q3-core-mailer');

Q3.config({
  authorization: {
    roles: ['Assassin', 'King', 'Badass'],
    conditions: ['isVeteran'],
  },
});

mailer.config({
  logo:
    'https://pbs.twimg.com/profile_images/1186142762179186688/icUsNEYO_400x400.jpg',
});

Q3.connect().then(() => {
  // noop
});
