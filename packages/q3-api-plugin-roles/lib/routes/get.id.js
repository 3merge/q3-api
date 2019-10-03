const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const { MODEL_NAME } = require('../constants');
const { permit, redact } = require('../middleware');

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
      req.translate('validations:mongoId'),
    ),
];

GetById.authorization = [
  permit(MODEL_NAME),
  redact('response').in('permission'),
];

module.exports = Q3.define(GetById);
