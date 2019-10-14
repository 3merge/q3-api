const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const { Permissions } = require('../../models');
const { MODEL_NAMES } = require('../../constants');
const {
  reportMongoId,
} = require('../../helpers/validation');

const GetById = async (
  { params: { permissionID } },
  res,
) => {
  const permission = await Permissions.findStrictly(
    permissionID,
  );
  res.ok({
    permission,
  });
};

GetById.validation = [
  verify(),
  check('permissionID')
    .isMongoId()
    .withMessage(reportMongoId),
];

GetById.authorization = [
  redact(MODEL_NAMES.PERMISSIONS).inResponse('permission'),
];

module.exports = compose(GetById);
