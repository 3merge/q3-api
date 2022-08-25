const onReverify =
  require('..').utils.createNotificationForUser(
    'verify',
    (user) => ({
      code: user.secret,
    }),
  );

module.exports = onReverify;
