const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const { MODEL_NAME } = require('../constants');
const { permit, redact } = require('../middleware');

const GetAll = async ({ query }, res) => {
  const permissions = await Q3.model(MODEL_NAME)
    .find(query)
    .exec();
  res.ok({
    permissions,
  });
};

GetAll.validation = [
  check('coll')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoCollectionName', [v]),
    ),
  check('role')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.translate('validations:role', [v]),
    ),
];

GetAll.authorization = [
  permit(MODEL_NAME),
  redact('response').inArray('permissions'),
];

module.exports = Q3.define(GetAll);
