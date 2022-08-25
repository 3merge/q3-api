module.exports =
  // eslint-disable-next-line
  require('q3-api').utils.createSingleUserNotificationChore(
    'password-reset',
    (user) => ({
      passwordResetToken: user.passwordResetToken,
    }),
  );
