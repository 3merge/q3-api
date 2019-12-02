const {
  matchedData,
  validationResult,
} = require('express-validator');
const { pickBy, identity } = require('lodash');

module.exports = (req, res, next) => {
  try {
    validationResult(req).throw();
    const opts = { includeOptionals: true };
    const data = matchedData(req, opts);
    req.body = pickBy(data, identity);
    next();
  } catch (err) {
    next({
      errors: err.mapped(),
    });
  }
};