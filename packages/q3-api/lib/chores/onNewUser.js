const onNewUser =
  require('..').utils.createNotificationForUser(
    'verify',
    (user) => ({
      code: user.secret,
    }),
  );

module.exports = onNewUser;
