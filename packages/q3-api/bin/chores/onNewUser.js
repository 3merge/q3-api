module.exports =
  // eslint-disable-next-line
  require('q3-api').utils.createSingleUserNotificationChore(
    'verify',
    (user) => ({
      code: user.secret,
    }),
  );
