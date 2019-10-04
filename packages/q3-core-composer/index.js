const connect = require('connect');
const aa = require('express-async-handler');
const dep = require('express-validator');
const authorize = require('./lib/authorize');
const effect = require('./lib/effect');
const validate = require('./lib/validate');

const {
  redact,
  verify,
  authorizeRequest,
  authorizeResponse,
} = authorize;

const flatten = (a = [], b = []) => {
  const m = connect();
  if (!a || !a.length) return m;
  a.concat(b)
    .flat()
    .forEach(m.use.bind(m));
  return m;
};

const compose = (ctr) =>
  flatten([
    flatten(ctr.validation, [validate]),
    flatten(ctr.authorization, [
      authorizeRequest,
      authorizeResponse,
    ]),
    flatten(effect(ctr.effect)),
    aa(ctr),
  ]);

module.exports = {
  ...dep,
  redact,
  verify,
  compose,
};
