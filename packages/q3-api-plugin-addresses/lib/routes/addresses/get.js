const { model } = require('q3-api');
const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const { KIND } = require('../../constants');

module.exports = (collectionName) => {
  const Collection = model(collectionName);

  const GetAddressesController = async (
    { params, query, marshal },
    res,
  ) => {
    const { kind } = query;
    const { documentID } = params;
    const doc = await Collection.findById(
      documentID,
    ).select('addresses');

    let addresses = doc ? marshal(doc).addresses : [];

    if (kind)
      addresses = addresses.filter((a) => a.kind === kind);

    res.ok({
      addresses,
    });
  };

  GetAddressesController.validation = [
    check('documentID')
      .isMongoId()
      .respondsWith('mongoID'),
    check('kind')
      .isIn(KIND)
      .optional()
      .respondsWith('mongoID'),
  ];

  GetAddressesController.authorization = [
    redact(collectionName)
      .withPrefix('addresses')
      .inResponse('addresses'),
  ];

  return compose(GetAddressesController);
};
