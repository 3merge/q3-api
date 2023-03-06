const onNewUser =
  require('..').utils.createNotificationForUser(
    'verify',
    (user) => ({
      id: user.id,
      code: user.secret,
      email: user.email,
      role: user.role,
    }),
  );

module.exports = onNewUser;
