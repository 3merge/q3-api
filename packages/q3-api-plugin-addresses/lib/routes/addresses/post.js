const { model } = require('q3-api');
const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const {
  addressDocumentFull,
} = require('../../validations');

module.exports = (collectionName) => {
  const Collection = model(collectionName);

  const CreateAddressController = async (
    { params, body, t },
    res,
  ) => {
    const { documentID } = params;
    const addresses = await Collection.insertNewAddress(
      documentID,
      body,
    );

    res.create({
      message: t('messages:newAddress'),
      addresses,
    });
  };

  CreateAddressController.validation = [
    check('documentID')
      .isMongoId()
      .respondsWith('mongoID'),
    ...addressDocumentFull,
  ];

  CreateAddressController.authorization = [
    redact(collectionName)
      .withPrefix('addresses')
      .inRequest('body')
      .inResponse('addresses'),
  ];

  return compose(CreateAddressController);
};
