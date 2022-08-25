const onPasswordReset =
  require('..').utils.createNotificationForUser(
    'password-reset',
    (user) => ({
      passwordResetToken: user.passwordResetToken,
    }),
  );

module.exports = onPasswordReset;
