const { model, exception } = require('q3-api');
const {
  compose,
  check,
  redact,
} = require('q3-core-composer');

module.exports = (collectionName) => {
  const Collection = model(collectionName);

  const DeleteAddressesController = async (
    { params, query },
    res,
  ) => {
    const { documentID } = params;
    const { ids } = query;

    const { nModified } = await Collection.updateOne(
      { _id: documentID },
      {
        $pull: {
          addresses: {
            _id: {
              $in: ids,
            },
          },
        },
      },
    );

    if (!nModified)
      exception('InternalServer')
        .msg('addressesNotRemoved')
        .throw();

    res.acknowledge();
  };

  DeleteAddressesController.validation = [
    check('documentID')
      .isMongoId()
      .respondsWith('mongoID'),
    check('ids.*')
      .isMongoId()
      .respondsWith('mongoID'),
  ];

  DeleteAddressesController.authorization = [
    redact(collectionName),
  ];

  return compose(DeleteAddressesController);
};
