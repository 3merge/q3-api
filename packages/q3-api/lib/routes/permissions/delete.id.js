const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');

const DeleteById = async (
  { params: { permissionID }, t },
  res,
) => {
  await Q3.model(MODEL_NAME).findByIdAndDelete(
    permissionID,
  );
  res.acknowledge({
    message: t('messages:permissionRemoved'),
  });
};

DeleteById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoId'),
    ),
];

DeleteById.authorization = [redact(MODEL_NAME)];

module.exports = compose(DeleteById);
