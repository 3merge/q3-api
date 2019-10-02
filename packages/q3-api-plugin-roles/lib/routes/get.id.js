const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const { MODEL_NAME } = require('../constants');

const GetById = async (
  { params: { permissionID } },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findStrictly(
    permissionID,
  );
  const permission = doc.toJSON({
    virtuals: true,
  });
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

module.exports = Q3.define(GetById);
