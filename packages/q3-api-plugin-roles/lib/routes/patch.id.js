const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const {
  MODEL_NAME,
  OWNERSHIP_ENUM,
} = require('../constants');
const { permit, redact } = require('../middleware');

const PatchById = async (
  { params: { permissionID }, body, translate },
  res,
) => {
  const permission = await Q3.model(
    MODEL_NAME,
  ).findStrictly(permissionID);
  permission.set(body);
  await permission.save();

  res.update({
    message: translate('message:permissionUpdated'),
    permission,
  });
};

PatchById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoId'),
    ),
  check('ownership')
    .isString()
    .optional()
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.translate('validations:ownership'),
    ),
  check('fields')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.translate('validations:commaDelineatedString'),
    ),
];

PatchById.authorization = [
  permit(MODEL_NAME),
  redact('request').in('body'),
  redact('response').in('permission'),
];

module.exports = Q3.define(PatchById);
