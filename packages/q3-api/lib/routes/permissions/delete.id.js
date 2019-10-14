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

const DeleteById = async (
  { params: { permissionID }, t },
  res,
) => {
  const { op, coll } = await Permissions.findByIdAndDelete(
    permissionID,
  );
  res.acknowledge({
    message: t.msg('permissions.removed', [op, coll]),
  });
};

DeleteById.validation = [
  check('permissionID')
    .isMongoId()
    .withMessage(reportMongoId),
];

DeleteById.authorization = [
  redact(MODEL_NAMES.PERMISSIONS),
];

module.exports = compose(DeleteById);
