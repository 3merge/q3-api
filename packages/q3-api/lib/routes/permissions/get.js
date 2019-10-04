const {
  check,
  compose,
  redact,
} = require('q3-core-composer');
const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');

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
  redact(MODEL_NAME)
    .inRequest('body')
    .inResponse('permissions'),
];

module.exports = compose(GetAll);
