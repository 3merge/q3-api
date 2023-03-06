const onReverify =
  require('..').utils.createNotificationForUser(
    'verify',
    (user) => ({
      code: user.secret,
      role: user.role,
    }),
  );

module.exports = onReverify;
