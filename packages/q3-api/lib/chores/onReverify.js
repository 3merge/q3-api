const onReverify =
  require('../helpers/createNotificationForUser')(
    'verify',
    (user) => ({
      code: user.secret,
    }),
  );

module.exports = onReverify;
