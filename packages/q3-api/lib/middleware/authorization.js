const { get } = require('lodash');
const ctx = require('request-context');
const { exception } = require('q3-core-responder');
const { MODEL_NAMES } = require('../constants');
const app = require('../config/express');
const mongoose = require('../config/mongoose');

const convertHTTPtoOp = (method) => {
  switch (method) {
    case 'PATCH':
    case 'PUT':
      return 'Update';
    case 'GET':
      return 'Read';
    case 'POST':
      return 'Create';
    case 'DELETE':
      return 'Delete';
    default:
      throw new Error('Method not allowed');
  }
};

const fetchPermission = async ({ role, op, coll }) => {
  if (role === 'Super')
    return {
      fields: '*',
      ownership: 'Any',
    };

  const grant = await mongoose
    .model(MODEL_NAMES.PERMISSIONS)
    .findOne({
      role,
      op,
      coll,
    })
    .setOptions({
      bypassAuthorization: true,
    })
    .exec();

  if (!grant)
    exception('Authorization')
      .msg('grants')
      .throw();

  await grant.isValid();
  return grant;
};

const middleware = (req, res, next) => {
  const { method, user } = req;
  const role = get(user, 'role', 'Public');
  const op = convertHTTPtoOp(method);

  req.authorization = async (coll) => {
    const result = await fetchPermission({
      role,
      op,
      coll,
    });

    if (
      result.condition &&
      (!user || !user[result.condition])
    )
      exception('Authorization')
        .msg('conditions')
        .throw();

    ctx.set('q3-session:grants', result);
    req.passedGrants = true;
    return result;
  };

  next();
};

app.use(middleware);
module.exports = middleware;
