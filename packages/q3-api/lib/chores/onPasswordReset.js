const onPasswordReset =
  require('..').utils.createNotificationForUser(
    'password-reset',
    (user) => ({
      email: user.email,
      passwordResetToken: user.passwordResetToken,
    }),
  );

module.exports = onPasswordReset;
