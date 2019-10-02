const Q3 = require('q3-api').default;
const { get } = require('lodash');
const ctx = require('request-context');
const mung = require('express-mung');
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

const permit = (coll) => async (req, res, next) => {
  const { method, user } = req;
  const role = get(user, 'role');
  let doc;

  if (role === 'Super') {
    req.redact = (v) => v;
    doc = {
      ownership: 'Any',
      fields: '*',
    };
  } else {
    doc = await Q3.model(MODEL_NAME).can(
      convertHTTPtoOp(method),
      coll,
      role,
    );

    req.redact = doc.pickFrom.bind(doc);
  }

  ctx.set('q3-session:user', user);
  ctx.set('q3-session:grants', doc);
  return next();
};

const redactRequest = (req, res, next) => {
  Object.assign(req.body, req.redact(req.body));
  next();
};

const redactResponse = (field) =>
  mung.json((body, req) =>
    Object.assign(body, {
      [field]: req.redact(body[field]),
    }),
  );

const redact = (location, field) => {
  if (location === 'request') return redactRequest;
  if (location === 'response') return redactResponse(field);
  return (req, res, next) => next();
};

module.exports = {
  permit,
  redact,
};
