const { get } = require('lodash');
const ctx = require('request-context');
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

const fetchPermission = async ({ role, op, coll }) =>
  role === 'Super'
    ? {
        fields: '*',
        ownership: 'Any',
      }
    : mongoose
        .model(MODEL_NAMES.PERMISSIONS)
        .findOne({
          role,
          op,
          coll,
        })
        .lean()
        .exec();

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

    ctx.set('q3-session:user', user);
    ctx.set('q3-session:grant', result);
    return result;
  };

  next();
};

app.use(middleware);
module.exports = middleware;
