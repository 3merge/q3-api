const { compose, verify } = require('q3-core-composer');

const GetAPIKeyController = async (
  { user, marshal },
  res,
) => {
  const { apiKeys } = await user.obfuscatePrivateFields();
  res.ok({
    keys: marshal(apiKeys),
  });
};

GetAPIKeyController.authorization = [verify];

module.exports = compose(GetAPIKeyController);
