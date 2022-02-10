const { compose, check } = require('q3-core-composer');
const Report = require('q3-plugin-changelog/lib/report');
const Controller = require('../audit/get');
const { MODEL_NAMES } = require('../../constants');

const { checkAuthorizationGrant, getCollectionName } =
  Controller.__$utils;

const AuditEmailsController = async (req, res) => {
  res.ok({
    users: await new Report(
      getCollectionName(req),
      req.query.id,
      MODEL_NAMES.USERS,
    ).getDistinctUsers(),
  });
};

AuditEmailsController.validation = [
  check('collectionName').isString(),
  check('id').isMongoId(),
];

AuditEmailsController.postAuthorization = [
  checkAuthorizationGrant,
];

module.exports = compose(AuditEmailsController);
