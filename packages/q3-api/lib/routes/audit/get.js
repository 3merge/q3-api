const { compose, check } = require('q3-core-composer');
const { get, find, pick, isObject } = require('lodash');
const qp = require('q3-core-rest/lib/queryParser');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const {
  findFileTraversingUpwards,
} = require('q3-schema-utils');
// alternative to mongoose plugin methods
const Report = require('q3-plugin-changelog/lib/report');

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
  const { query } = qp(req);
  const coll = getCollectionName(req);
  const { id, template } = query;

  const settings = find(
    findFileTraversingUpwards(
      get(req, 'app.locals.location'),
      'q3-audit.json',
    ),
    (item) =>
      item.coll === coll && item.template === template,
  );

  if (!settings || !isObject(settings.fields))
    exception('Validation')
      .msg('unknownAuditTemplate')
      .throw();

  const { fields } = settings;

  res.ok({
    changes: await new Report(coll, id).getData(
      pick(query, ['date', 'user']),
      Object.keys(fields),
      (key) => fields[key],
    ),
  });
};

AuditController.validation = [
  check('collectionName').isString(),
  check('template').isString(),
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
