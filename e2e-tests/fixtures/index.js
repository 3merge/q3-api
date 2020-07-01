const Q3 = require('q3-api');
const supertest = require('supertest');
const conf = require('./config');

const { Users } = Q3;

const genUser = (email = 'mibberson@3merge.ca') => () =>
  Users.create({
    firstName: 'Mike',
    lastName: 'Ibberson',
    role: 'Developer',
    lang: 'en-CA',
    email,
  });

const setVerificationProps = async (user) => {
  const props = {
    secret: 'Shh!',
    verified: true,
  };

  await user.set(props).setPassword();
  return user;
};

module.exports = (email) =>
  conf
    .connect()
    .then(genUser(email))
    .then(setVerificationProps)
    .then(async (user) => ({
      Authorization: `Apikey ${await user.generateApiKey()}`,
      agent: supertest(Q3.$app),
    }));
