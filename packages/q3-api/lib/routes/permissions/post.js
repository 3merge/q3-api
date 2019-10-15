const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const { MODEL_NAMES } = require('../../constants');
const { Permissions } = require('../../models');
const { constants } = require('../../models/permission');
const { checkMsg } = require('../../helpers/validation');

const Post = async ({ body, t }, res) => {
  const doc = await Permissions.create(body);

  res.create({
    message: t('messages:permission.new'),
    permission: doc.toJSON(),
  });
};

Post.validation = [
  check('coll')
    .isString()
    .withMessage(checkMsg),
  check('op')
    .isString()
    .isIn(constants.OP_ENUM)
    .withMessage(checkMsg),
  check('ownership')
    .isString()
    .isIn(constants.OWNERSHIP_ENUM)
    .withMessage(checkMsg),
  check('role')
    .isString()
    .withMessage(checkMsg),
  check('fields')
    .isString()
    .optional()
    .withMessage(checkMsg),
];

Post.authorization = [
  redact(MODEL_NAMES.PERMISSIONS)
    .inRequest('body')
    .inResponse('permission'),
];

module.exports = compose(Post);
