const { compose, redact } = require('q3-core-composer');
const flat = require('flat');

const getProfile = async (req, res) => {
  const { body, files, user, marshal } = req;

  await user.handleReq({
    body,
    files,
  });

  await user.set(flat.unflatten(body)).save();

  res.update({
    profile: marshal(user.obfuscatePrivateFields()),
  });
};

getProfile.authorization = [
  redact('profile')
    .inRequest('body')
    .inResponse('profile')
    .done(),
];

module.exports = compose(getProfile);
