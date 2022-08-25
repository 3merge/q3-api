const onPasswordChange =
  require('../helpers/createNotificationForUser')(
    'password-change',
  );

module.exports = onPasswordChange;
