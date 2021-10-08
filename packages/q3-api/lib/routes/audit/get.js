const {
  compose,
  check,
  isLoggedIn,
} = require('q3-core-composer');
const { get } = require('lodash');
const qp = require('q3-core-rest/lib/queryParser');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const { model } = require('../..');

const getCollectionName = (req) =>
  get(qp(req), 'query.collectionName');

const checkAuthorizationGrant = (req, res, next) => {
  const { user } = req;
  const collectionName = getCollectionName(req);

  const getGrant = (coll) =>
    new Grant(user).can('Read').on(coll).test({});

  return next(
    !getGrant('audit') ||
      !collectionName ||
      !getGrant(collectionName)
      ? exception('Authorization')
          .msg('cannotAuditChanges')
          .boomerang()
      : undefined,
  );
};

const getModelInstance = async (req, res, next) => {
  const { id } = req.query;
  const collectionName = getCollectionName(req);

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

const Controller = compose(AuditController);

module.exports = Controller;

Controller.__$utils = {
  checkAuthorizationGrant,
  getModelInstance,
};
