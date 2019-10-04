const { compose, verify } = require('q3-core-composer');
const { Permissions } = require('../../models');

const getProfile = async ({ user }, res) => {
  const permissions = await Permissions.find({
    role: user.role,
  })
    .lean()
    .exec();

  res.ok({
    profile: user.obfuscatePrivateFields(),
    permissions,
  });
};

getProfile.authorization = [verify()];
module.exports = compose(getProfile);
