const { check, compose } = require('q3-core-composer');
const { Users } = require('../../models');

const LookupAccount = async ({ query: { email } }, res) => {
  await Users.findByEmail(email);
  res.acknowledge();
};

LookupAccount.validation = [
  check('email').isEmail().respondsWith('email'),
];

module.exports = compose(LookupAccount);
