const { compose, verify } = require('q3-core-composer');
const { AccessControl } = require('q3-core-access');

const getProfile = async ({ user, marshal }, res) => {
  if (typeof user.loadProfile === 'function')
    await user.loadProfile();

  res.ok({
    profile: marshal(user.obfuscatePrivateFields()),
    permissions: AccessControl.get(user.role),
  });
};

getProfile.authorization = [verify];
module.exports = compose(getProfile);
