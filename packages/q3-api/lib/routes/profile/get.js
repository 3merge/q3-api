const {
  compose,
  redact,
  isLoggedIn,
} = require('q3-core-composer');
const { AccessControl } = require('q3-core-access');

const getProfile = async ({ user, marshal }, res) => {
  if (typeof user.loadProfile === 'function')
    await user.loadProfile();

  res.ok({
    profile: marshal(user.obfuscatePrivateFields()),
    permissions: AccessControl.get(user.role),
  });
};

getProfile.authorization = [
  isLoggedIn,
  redact('profile').inResponse('profile').done(),
];

module.exports = compose(getProfile);
