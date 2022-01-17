const { compose, check } = require('q3-core-composer');
const { get, pick } = require('lodash');
const qp = require('q3-core-rest/lib/queryParser');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
// alternative to mongoose plugin methods
const Report = require('q3-plugin-changelog/lib/report');
const aqp = require('api-query-params');
const { translate } = require('../../helpers');

const getCollectionName = (req) =>
  get(qp(req), 'query.collectionName');

const checkAuthorizationGrant = (req, res, next) => {
  const { user } = req;
  const collectionName = getCollectionName(req);

  const getGrant = (coll) =>
    new Grant(user).can('Read').on(coll).first();

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

const AuditController = async (req, res) => {
  const { id, targets, ...rest } = req.query;

  res.ok({
    changes: await new Report(
      getCollectionName(req),
      id,
    ).getData(
      aqp(pick(rest, ['date', 'user'])).filter,
      targets,
      translate.messages,
    ),
  });
};

AuditController.validation = [
  check('collectionName').isString(),
  check('targets').isString(),
  check('id').isMongoId(),
  check('date>').isISO8601().optional(),
  check('date<').isISO8601().optional(),
  check('user').isMongoId().optional(),
];

AuditController.postAuthorization = [
  checkAuthorizationGrant,
];

const Controller = compose(AuditController);

module.exports = Controller;

Controller.__$utils = {
  checkAuthorizationGrant,
  getCollectionName,
};
