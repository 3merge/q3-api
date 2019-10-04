const {
  matchedData,
  validationResult,
} = require('express-validator');
const { pickBy } = require('lodash');

const isTruthy = (a) => a !== null && a !== undefined;

module.exports = (req, res, next) => {
  try {
    validationResult(req).throw();
    const opts = { includeOptionals: true };
    const data = matchedData(req, opts);
    req.body = pickBy(data, isTruthy);
    next();
  } catch (err) {
    next({
      errors: err.mapped(),
    });
  }
};
