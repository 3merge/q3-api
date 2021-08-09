const {
  compose,
  check,
  isLoggedIn,
} = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const { model } = require('../..');

const checkAuthorizationGrant = ({ user }, res, next) => {
  next(
    !new Grant(user).can('Read').on('changelog').test({})
      ? exception('Authorization')
          .msg('cannotAuditChanges')
          .boomerang()
      : undefined,
  );
};

const getModelInstance = async (req, res, next) => {
  const { id, collectionName } = req.query;
  req.auditSource = model(collectionName);

  try {
    if (id)
      req.auditSource = await req.auditSource.findStrictly(
        id,
      );

    next();
  } catch (e) {
    next(e);
  }
};

const AuditController = async (
  { auditSource, query },
  res,
) => {
  res.ok({
    changes: await auditSource.getHistory(query),
  });
};

AuditController.authorization = [isLoggedIn];

AuditController.validation = [
  check('collectionName').isString(),
  check('id').isMongoId().optional(),
  check('date').isISO8601().optional(),
  check('operations').isArray().optional(),
  check('skip').isNumeric().optional(),
  check('user').isNumeric().optional(),
];

AuditController.postAuthorization = [
  checkAuthorizationGrant,
  getModelInstance,
];

module.exports = compose(AuditController);
