const { compose, verify } = require('q3-core-composer');

const getProfile = async (req, res) => {
  const { body, user, marshal } = req;
  await user.set(body).save();

  res.update({
    profile: marshal(user.obfuscatePrivateFields()),
  });
};

getProfile.authorization = [verify];
module.exports = compose(getProfile);
