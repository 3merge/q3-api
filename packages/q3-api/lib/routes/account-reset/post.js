const { compose, redact } = require('q3-core-composer');
const { Users } = require('../../models');

const CreateAPIKeyController = async ({ query }, res) => {
  const user = await Users.findStrictly(query.id);
  await user.setSecret().save();
  res.acknowledge();
};

CreateAPIKeyController.authorization = [
  redact(Users.collection.collectionName)
    .requireField('secret')
    .done(),
];

module.exports = compose(CreateAPIKeyController);
