const onNewUser =
  require('../helpers/createNotificationForUser')(
    'verify',
    (user) => ({
      code: user.secret,
    }),
  );

module.exports = onNewUser;
