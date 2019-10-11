const {
  compose,
  check,
  redact,
  verify,
} = require('q3-core-composer');
const {
  MODEL_NAMES,
  OWNERSHIP_ENUM,
} = require('../../constants');
const {
  reportMongoId,
} = require('../../helpers/validation');
const { Permissions } = require('../../models');

const PatchById = async (
  { params: { permissionID }, body, t },
  res,
) => {
  const permission = await Permissions.findStrictly(
    permissionID,
  );
  permission.set(body);
  const { role, coll } = await permission.save();

  res.update({
    message: t.msg('permission.update', [role, coll]),
    permission,
  });
};

PatchById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage(reportMongoId),
  check('ownership')
    .isString()
    .optional()
    .isIn(OWNERSHIP_ENUM)
    .withMessage((v, { req }) =>
      req.t('validations:ownership'),
    ),
  check('fields')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.t('validations:commaDelineatedString'),
    ),
];

PatchById.authorization = [
  verify(),
  redact(MODEL_NAMES.PERMISSION)
    .inRequest('body')
    .inResponse('permission'),
];

module.exports = compose(PatchById);
