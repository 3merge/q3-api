const {
  compose,
  check,
  isLoggedIn,
} = require('q3-core-composer');
const qp = require('q3-core-rest/lib/queryParser');
const { map, pick } = require('lodash');
const { Grant, Redact } = require('q3-core-access');
const Controller = require('../audit/get');

const { checkAuthorizationGrant, getModelInstance } =
  Controller.__$utils;

const AuditEmailsController = async (req, res) => {
  const users =
    await req.auditSource.getUsersWhoHaveMadeChanges(
      qp(req).query,
    );

  const grant = new Grant(req.user)
    .can('Read')
    .on('q3-api-users')
    .test({});

  res.ok({
    users: map(users, (user) => {
      const output = pick(
        Redact.flattenAndReduceByFields(user, grant),
        ['email', 'name'],
      );

      return {
        id: user._id.toString(),
        ...output,
      };
    }),
  });
};

AuditEmailsController.authorization = [isLoggedIn];

AuditEmailsController.validation = [
  check('collectionName').isString(),
  check('id').isMongoId().optional(),
];

AuditEmailsController.postAuthorization = [
  checkAuthorizationGrant,
  getModelInstance,
];

module.exports = compose(AuditEmailsController);
