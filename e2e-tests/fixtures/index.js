require('./models');
const Q3 = require('q3-api');
const access = require('./q3-access.json');

const { Users } = Q3;

module.exports = () =>
  Q3.config({
    location: __dirname,
  })
    .protect(access)
    .routes()
    .connect()
    .then(() =>
      Users.create({
        firstName: 'Mike',
        lastName: 'Ibberson',
        role: 'Developer',
        email: 'mibberson@3merge.ca',
        lang: 'en-CA',
      }),
    );
