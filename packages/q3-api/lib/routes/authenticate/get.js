const { check, compose } = require('q3-core-composer');
const { isNil } = require('lodash');
const { Users } = require('../../models');

const LookupAccount = async ({ query: { email } }, res) => {
  res.ok({
    exists: !isNil(
      await Users.findOne({
        email,
      })
        .lean()
        .exec(),
    ),
  });
};

LookupAccount.validation = [
  check('email').isEmail().respondsWith('email'),
];

module.exports = compose(LookupAccount);
