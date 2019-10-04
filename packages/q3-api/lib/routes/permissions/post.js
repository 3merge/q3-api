const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const Q3 = require('q3-api');
const {
  MODEL_NAME,
  OWNERSHIP_ENUM,
  OP_ENUM,
} = require('../constants');

const Post = async ({ body, t }, res) => {
  const permission = await Q3.model(MODEL_NAME).create(
    body,
  );
  res.create({
    message: t('messages:newPermission'),
    permission,
  });
};

Post.validation = [
  check('coll')
    .isString()
    .withMessage((v, { req }) => req.t('validations:coll')),
  check('op')
    .isString()
    .isIn(OP_ENUM)
    .withMessage((v, { req }) => req.t('validations:op')),
  check('ownership')
    .isString()
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.t('validations:ownership'),
    ),
  check('role')
    .isString()
    .withMessage((v, { req }) => req.t('validations:role')),
  check('fields')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.t('validations:commaDelineatedString'),
    ),
];

Post.authorization = [
  redact(MODEL_NAME)
    .inRequest('body')
    .inResponse('permission'),
];

module.exports = compose(Post);
