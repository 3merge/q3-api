const {
  check,
  compose,
  redact,
} = require('q3-core-composer');
const { Permissions } = require('../../models');
const { MODEL_NAMES } = require('../../constants');

const GetAll = async ({ query }, res) => {
  const docs = await Permissions.find(query).exec();
  res.ok({
    permissions: docs.map((doc) => doc.toJSON()),
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
  redact(MODEL_NAMES.PERMISSIONS)
    .inRequest('body')
    .inResponse('permissions'),
];

module.exports = compose(GetAll);
