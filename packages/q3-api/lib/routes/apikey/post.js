const { compose, verify } = require('q3-core-composer');

const CreateAPIKeyController = async ({ user, t }, res) => {
  res.create({
    message: t('messages:apikeygenerated'),
    key: await user.generateApiKey(),
  });
};

CreateAPIKeyController.authorization = [verify];

module.exports = compose(CreateAPIKeyController);
