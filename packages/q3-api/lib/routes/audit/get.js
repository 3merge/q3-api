const {
  compose,
  check,
  isLoggedIn,
} = require('q3-core-composer');
const qp = require('q3-core-rest/lib/queryParser');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const { model } = require('../..');

const checkAuthorizationGrant = (
  { query, user },
  res,
  next,
) => {
  const getGrant = (coll) =>
    new Grant(user).can('Read').on(coll).test({});

  return next(
    !getGrant('audit') || !getGrant(query.collectionName)
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

const AuditController = async (req, res) => {
  res.ok({
    changes: await req.auditSource.getHistory(
      qp(req).query,
    ),
  });
};

AuditController.authorization = [isLoggedIn];

AuditController.validation = [
  check('collectionName').isString(),
  check('id').isMongoId().optional(),
  check('date').isISO8601().optional(),
  check('operation').isString().optional(),
  check('skip').isNumeric().optional(),
  check('user').isMongoId().optional(),
];

AuditController.postAuthorization = [
  checkAuthorizationGrant,
  getModelInstance,
];

module.exports = compose(AuditController);
