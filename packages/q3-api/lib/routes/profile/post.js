const { compose, verify } = require('q3-core-composer');

const getProfile = async (req, res) => {
  const { body, files, user, marshal } = req;

  await user.handleReq({
    body,
    files,
  });

  await user.set(body).save();

  res.update({
    profile: marshal(user.obfuscatePrivateFields()),
  });
};

getProfile.authorization = [verify];
module.exports = compose(getProfile);
