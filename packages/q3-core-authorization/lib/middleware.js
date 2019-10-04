const { model } = require('q3-api');
const { get } = require('lodash');
const ctx = require('request-context');
const { MODEL_NAME } = require('./constants');

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
    : model(MODEL_NAME)
        .findOne({
          role,
          op,
          coll,
        })
        .lean()
        .exec();

module.exports = (req, res, next) => {
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
    ctx.set('q3-session:grant', user);
    return result;
  };

  next();
};
