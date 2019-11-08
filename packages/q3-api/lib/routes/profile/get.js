const { compose, verify } = require('q3-core-composer');
const { Permissions } = require('../../models');

const getProfile = async ({ user, marshal }, res) => {
  const permissions = await Permissions.find({
    role: user.role,
    active: true,
  })
    .setOptions({
      bypassAuthorization: true,
    })
    .lean()
    .exec();

  res.ok({
    profile: marshal(user.obfuscatePrivateFields()),
    permissions,
  });
};

getProfile.authorization = [verify];
module.exports = compose(getProfile);
