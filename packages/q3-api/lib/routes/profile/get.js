const { compose, redact } = require('q3-core-composer');
const { AccessControl } = require('q3-core-access');
const { emit } = require('q3-core-mailer');

const getProfile = async ({ user, marshal }, res) => {
  if (typeof user.loadProfile === 'function')
    await user.loadProfile();

  emit('onRoutine');

  res.ok({
    profile: marshal(user.obfuscatePrivateFields()),
    permissions: AccessControl.get(user.role),
  });
};

getProfile.authorization = [
  redact('profile').inResponse('profile').done(),
];

module.exports = compose(getProfile);
