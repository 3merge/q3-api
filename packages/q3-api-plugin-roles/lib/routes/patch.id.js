const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const {
  MODEL_NAME,
  OWNERSHIP_ENUM,
} = require('../constants');

const PatchById = async (
  { params: { permissionID }, body, translate },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findStrictly(
    permissionID,
  );
  doc.set(body);
  await doc.save();

  const permission = doc.toJSON({
    virtuals: true,
  });
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
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.translate('validations:ownership'),
    ),
  check('fields')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:commaDelineatedString'),
    ),
];

module.exports = Q3.define(PatchById);
