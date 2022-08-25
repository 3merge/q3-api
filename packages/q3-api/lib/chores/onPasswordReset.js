const onPasswordReset =
  require('../helpers/createNotificationForUser')(
    'password-reset',
    (user) => ({
      passwordResetToken: user.passwordResetToken,
    }),
  );

module.exports = onPasswordReset;
