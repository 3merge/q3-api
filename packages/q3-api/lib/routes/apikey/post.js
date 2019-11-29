const { compose, redact } = require('q3-core-composer');
const { Users } = require('../../models');

const CreateAPIKeyController = async ({ user, t }, res) => {
  res.create({
    message: t('messages:apikeygenerated'),
    key: await user.generateApiKey(),
  });
};

CreateAPIKeyController.authorization = [
  redact(Users.collection.collectionName)
    .requireField('apiKeys')
    .done(),
];

module.exports = compose(CreateAPIKeyController);
