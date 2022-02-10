const Q3 = require('q3-api');
// eslint-disable-next-line
const supertest = require('supertest');
const conf = require('./config');

const { Users } = Q3;

const genUser =
  (email = 'mibberson@3merge.ca', role = 'Developer') =>
  () =>
    Users.create({
      firstName: 'Mike',
      lastName: 'Ibberson',
      lang: 'en',
      role,
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

module.exports = (email, role) =>
  conf
    .connect()
    .then(genUser(email, role))
    .then(setVerificationProps)
    .then(async (user) => ({
      Authorization: `Apikey ${await user.generateApiKey()}`,
      agent: supertest(Q3.$app),
      user,
    }));
