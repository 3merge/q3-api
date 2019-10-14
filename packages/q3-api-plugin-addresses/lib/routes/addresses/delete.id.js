const { model, exception } = require('q3-api');
const {
  compose,
  check,
  redact,
} = require('q3-core-composer');

module.exports = (collectionName) => {
  const Collection = model(collectionName);

  const DeleteAddressController = async (
    { params },
    res,
  ) => {
    const { documentID, addressID } = params;
    const { nModified } = await Collection.updateOne(
      { _id: documentID },
      {
        $pull: {
          addresses: {
            _id: addressID,
          },
        },
      },
    );

    if (!nModified)
      exception('InternalServer')
        .msg('addressNotRemoved')
        .throw();

    res.acknowledge();
  };

  DeleteAddressController.validation = [
    check('documentID')
      .isMongoId()
      .respondsWith('mongoID'),
    check('addressID')
      .isMongoId()
      .respondsWith('mongoID'),
  ];

  DeleteAddressController.authorization = [
    redact(collectionName),
  ];

  return compose(DeleteAddressController);
};
