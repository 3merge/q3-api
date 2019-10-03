const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const {
  MODEL_NAME,
  OWNERSHIP_ENUM,
  OP_ENUM,
} = require('../constants');
const { permit, redact } = require('../middleware');

const Post = async ({ body, translate }, res) => {
  const permission = await Q3.model(MODEL_NAME).create(
    body,
  );
  res.create({
    message: translate('messages:newPermission'),
    permission,
  });
};

Post.validation = [
  check('coll')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:coll'),
    ),
  check('op')
    .isString()
    .isIn(OP_ENUM)
    .withMessage((v, { req }) =>
      req.translate('validations:op'),
    ),
  check('ownership')
    .isString()
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.translate('validations:ownership'),
    ),
  check('role')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:role'),
    ),
  check('fields')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.translate('validations:commaDelineatedString'),
    ),
];

Post.authorization = [
  permit(MODEL_NAME),
  redact('request').in('body'),
  redact('response').in('permission'),
];

module.exports = Q3.define(Post);
