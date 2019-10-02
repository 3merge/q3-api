const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const { MODEL_NAME } = require('../constants');

const DeleteById = async (
  { params: { permissionID }, translate },
  res,
) => {
  await Q3.model(MODEL_NAME).findByIdAndDelete(
    permissionID,
  );
  res.acknownledge({
    message: translate('messages:permissionRemoved'),
  });
};

DeleteById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoId'),
    ),
];

module.exports = Q3.define(DeleteById);
