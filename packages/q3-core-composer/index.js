const connect = require('connect');
const aa = require('express-async-handler');
const dep = require('express-validator');
const authorize = require('./lib/authorize');
const middleware = require('./lib/middleware');
const { validateBody } = require('./lib/validate');

const {
  redact,
  verify,
  authorizeRequest,
  authorizeResponse,
} = authorize;

const flatten = (a = [], b = []) => {
  const m = connect();
  if (!a || !a.length) return m;
  const arr = a.concat(b).flat();

  arr.forEach(m.use.bind(m));
  m.root = arr.pop();
  return m;
};

const check = (...args) => {
  const methods = dep.check(...args);
  methods.respondsWith = (name) =>
    methods.withMessage((value, { req }) =>
      req.t(`validations:${name}`, {
        value,
      }),
    );

  return methods;
};

const compose = (ctr) =>
  flatten([
    flatten(ctr.validation, [validateBody]),
    flatten(ctr.authorization, [
      verify,
      authorizeRequest,
      authorizeResponse,
    ]),
    aa(ctr),
    ctr,
  ]);

module.exports = {
  ...dep,
  redact,
  verify,
  compose,
  check,
  middleware,
};
