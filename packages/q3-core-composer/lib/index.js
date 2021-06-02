const connect = require('connect');
const {
  middleware: sessionMiddleware,
} = require('q3-core-session');
const aa = require('express-async-handler');
const dep = require('express-validator');
const validateBody = require('m2e-validator/lib/middlewareHelper');
const response = require('./postware');
const middleware = require('./middleware');
const isAuthorized = require('./middleware/isAuthorized');
const isVerified = require('./middleware/isLoggedIn');

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
    flatten(ctr.authorization, [isVerified, response]),
    sessionMiddleware,
    ...(ctr.postAuthorization ? ctr.postAuthorization : []),
    aa(ctr),
  ]);

module.exports = {
  ...dep,
  redact: isAuthorized, // alias
  verify: isVerified, // alias
  isVerified,
  isAuthorized,
  compose,
  check,
  middleware,
};
