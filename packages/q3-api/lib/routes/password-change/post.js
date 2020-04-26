const {
  compose,
  check,
  verify,
} = require('q3-core-composer');
const { emit } = require('q3-core-mailer');
const { exception } = require('q3-core-responder');
const { Users } = require('../../models');

const matchesConfirmNewPasswordField = (value, { req }) => {
  if (value !== req.body.confirmNewPassword)
    exception('Validation')
      .field('confirmNewPassword')
      .throw();

  return value;
};

const updatePassword = async (
  {
    body: {
      previousPassword,
      passwordResetToken,
      newPassword,
      email,
    },
    user,
  },
  res,
) => {
  let doc;

  if (previousPassword) {
    doc = await Users.findVerifiedById(user.id);
    await doc.verifyPassword(previousPassword, true);
  } else if (passwordResetToken) {
    doc = await Users.findVerifiedByEmail(email);
    if (doc.cannotResetPassword)
      exception('Conflict')
        .msg('expired')
        .field('passwordResetToken')
        .throw();
  }

  if (!doc)
    exception('Validation')
      .msg('previousPasswordOrTokenRequired')
      .throw();

  await doc.setPassword(newPassword);
  emit('onPasswordChange', doc);
  res.acknowledge();
};

updatePassword.validation = [
  check('email').isEmail().optional(),
  check('previousPassword').isString().optional(),
  check('passwordResetToken').isString().optional(),
  check('newPassword')
    .isString()
    .custom(matchesConfirmNewPasswordField)
    .withMessage((v, { req }) => req.t.val('newPassword')),
];

updatePassword.authorization = [verify];

const Ctrl = compose(updatePassword);
Ctrl.matchesConfirmNewPasswordField = matchesConfirmNewPasswordField;
Ctrl.$og = updatePassword;

module.exports = Ctrl;
