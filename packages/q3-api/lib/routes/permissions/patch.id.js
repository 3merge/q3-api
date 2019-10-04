const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const Q3 = require('q3-api');
const {
  MODEL_NAME,
  OWNERSHIP_ENUM,
} = require('../constants');

const PatchById = async (
  { params: { permissionID }, body, t },
  res,
) => {
  const permission = await Q3.model(
    MODEL_NAME,
  ).findStrictly(permissionID);
  permission.set(body);
  await permission.save();

  res.update({
    message: t('message:permissionUpdated'),
    permission,
  });
};

PatchById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoId'),
    ),
  check('ownership')
    .isString()
    .optional()
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.t('validations:ownership'),
    ),
  check('fields')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.t('validations:commaDelineatedString'),
    ),
];

PatchById.authorization = [
  redact(MODEL_NAME)
    .inRequest('body')
    .inResponse('permission'),
];

module.exports = compose(PatchById);
