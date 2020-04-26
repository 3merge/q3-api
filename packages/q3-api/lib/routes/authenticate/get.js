const { check, compose } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { Users } = require('../../models');

const LookupAccount = async ({ query: { email } }, res) => {
  if (!(await Users.findOne({ email }).lean().exec()))
    exception('BadRequest').msg('account').throw();

  res.acknowledge();
};

LookupAccount.validation = [
  check('email').isEmail().respondsWith('email'),
];

module.exports = compose(LookupAccount);
