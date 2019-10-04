const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');

const GetById = async (
  { params: { permissionID } },
  res,
) => {
  const permission = await Q3.model(
    MODEL_NAME,
  ).findStrictly(permissionID);
  res.ok({
    permission,
  });
};

GetById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoId'),
    ),
];

GetById.authorization = [
  redact(MODEL_NAME).inResponse('permission'),
];

module.exports = compose(GetById);
