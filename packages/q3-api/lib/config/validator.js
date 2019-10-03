const { pickBy } = require('lodash');
const {
  matchedData,
  validationResult,
} = require('express-validator');
const { compose } = require('../helpers/utils');
const { errors } = require('../helpers/errors');

const { ValidationError } = errors;
const isTruthy = (a) => a !== null && a !== undefined;

const validate = (req, res, next) => {
  try {
    validationResult(req).throw();
    const opts = { includeOptionals: true };
    const data = matchedData(req, opts);
    req.body = pickBy(data, isTruthy);
    next();
  } catch (err) {
    next(new ValidationError(err.mapped()));
  }
};

module.exports = (middleware = []) =>
  compose([...middleware, validate]);
