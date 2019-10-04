const { compose, check } = require('q3-core-composer');
const { Users } = require('../../models');
const exception = require('../../errors');

const lookupAccountByEmail = async (
  { query: { email } },
  res,
) => {
  const doc = await Users.findOne({ email })
    .lean()
    .exec();

  if (!doc)
    exception('BadRequest')
      .msg('errors:account')
      .throw();

  res.acknowledge();
};

lookupAccountByEmail.validation = [
  check('email').isEmail(),
];

module.exports = compose(lookupAccountByEmail);
