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

  const UpdateAddressController = async (
    { params, body, t },
    res,
  ) => {
    const { documentID, addressID } = params;
    const addresses = await Collection.updateAnAddress(
      documentID,
      addressID,
      body,
    );

    res.update({
      message: t('messages:updatedAddress'),
      addresses,
    });
  };

  UpdateAddressController.validation = [
    check('documentID')
      .isMongoId()
      .respondsWith('mongoID'),
    check('addressID')
      .isMongoId()
      .respondsWith('mongoID'),
    ...addressDocumentFull,
  ];

  UpdateAddressController.authorization = [
    redact(collectionName)
      .withPrefix('addresses')
      .inRequest('body')
      .inResponse('addresses'),
  ];

  return compose(UpdateAddressController);
};
