const { compose } = require('q3-core-composer');
const { Users } = require('../../models');
const mailer = require('../../config/mailer');
const { checkEmail } = require('../../helpers/validation');

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

resetPassword.validation = [checkEmail];

resetPassword.effect = [
  ({ to, password }, { t }) => {
    mailer(to, t.val('passwordReset', [password]));
  },
];

module.exports = compose(resetPassword);
