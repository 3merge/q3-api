require('./models');
const Q3 = require('q3-api');
const access = require('./q3-access.json');

const { Users } = Q3;

module.exports = () =>
  Q3.config({
    locale: './locale',
    triggers: './triggers',
  })
    .protect(access)
    .routes()
    .connect(process.env.CONNECTION)
    .then(() =>
      Users.create({
        firstName: 'Mike',
        lastName: 'Ibberson',
        role: 'Developer',
        email: 'mibberson@3merge.ca',
        lang: 'en-CA',
      }),
    );
