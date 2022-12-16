const onNewUser =
  require('..').utils.createNotificationForUser(
    'verify',
    (user) => ({
      id: user.id,
      code: user.secret,
      email: user.email,
    }),
  );

module.exports = onNewUser;
