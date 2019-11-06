const { compose, redact } = require('q3-core-composer');
const { Users } = require('../../models');

const GetAPIKeyController = async (
  { user, marshal },
  res,
) => {
  const { apiKeys } = await user.obfuscatePrivateFields();
  res.create({
    keys: marshal(apiKeys),
  });
};

GetAPIKeyController.authorization = [
  redact(Users.collection.collectionName).requiredField(
    'apiKeys',
  ),
];

module.exports = compose(GetAPIKeyController);
