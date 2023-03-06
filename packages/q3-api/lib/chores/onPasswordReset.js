const onPasswordReset =
  require('..').utils.createNotificationForUser(
    'password-reset',
    (user) => ({
      email: user.email,
      passwordResetToken: user.passwordResetToken,
      role: user.role,
    }),
  );

module.exports = onPasswordReset;
