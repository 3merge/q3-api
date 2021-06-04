const {
  check,
  compose,
  exception,
} = require('q3-core-composer');
const { Users } = require('../../models');

const VerifyEmail = async (
  { body: { email, code } },
  res,
) => {
  const doc = await Users.findByEmail(email);

  if (!doc)
    exception('BadRequest')
      .msg('emailAddressNotFound')
      .throw();

  await doc.verifyStrategyWithCode(code);
  res.acknowledge();
};

VerifyEmail.validation = [
  check('email').isEmail().respondsWith('email'),
  check('code').isString().respondsWith('code'),
];

module.exports = compose(VerifyEmail);
