const { Grant, Redact } = require('q3-core-access');
const { compose, redact } = require('q3-core-composer');

const getProfile = async (req, res) => {
  const { files, user, marshal } = req;
  const grant = new Grant(req.user)
    .can('Create')
    .on('profile')
    .test({});

  const body = Redact.flattenAndReduceByFields(
    req.body,
    grant,
  );

  await user.handleReq({ body, files });
  await user.set(body).save();

  res.update({
    profile: marshal(user.obfuscatePrivateFields()),
  });
};

getProfile.authorization = [
  redact('profile').inResponse('profile').done(),
];

module.exports = compose(getProfile);
