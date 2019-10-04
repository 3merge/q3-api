const { check, compose } = require('q3-core-composer');
const { Users } = require('../../models');
const mailer = require('../../config/mailer');

const resetPassword = async (
  { body: { email }, evoke },
  res,
) => {
  const doc = await Users.findVerifiedByEmail(email);
  const password = await doc.setPassword();

  evoke({
    to: email,
    password,
  });

  res.acknowledge();
};

resetPassword.validation = [
  check('email')
    .isEmail()
    .withMessage((v, { req }) =>
      req.t('validations:email'),
    ),
];

resetPassword.effect = [
  ({ to, password }, { t }) => {
    mailer(to, t('messages:passwordReset', [password]));
  },
];

module.exports = compose(resetPassword);
