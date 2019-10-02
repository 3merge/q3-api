const Q3 = require('q3-api').default;
const { check } = require('express-validator');
const {
  MODEL_NAME,
  OWNERSHIP_ENUM,
  OP_ENUM,
} = require('../constants');

const Post = async ({ body, translate }, res) => {
  const doc = await Q3.model(MODEL_NAME).create(body);
  const permission = doc.toJSON({
    virtuals: true,
  });
  res.create({
    message: translate('messages:newPermission'),
    permission,
  });
};

Post.validation = [
  check('collection')
    .isString()
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.translate('validations:collection'),
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
    .withMessage((v, { req }) =>
      req.translate('validations:commaDelineatedString'),
    ),
];

module.exports = Q3.define(Post);
