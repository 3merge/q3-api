const {
  matchedData,
  validationResult,
  checkSchema,
} = require('express-validator');
const { pickBy } = require('lodash');

const isTruthy = (a) => a !== null && a !== undefined;

const validateIf = (
  discriminatorKey = '__t',
  schemas = {},
) => async (req, res, next) => {
  const v = req.body[discriminatorKey];
  const schema = schemas[v || 'base'];

  if (schema) {
    await Promise.all(
      checkSchema(schema).map((e) => e.run(req)),
    );
    next();
  } else {
    next(
      new Error(req.t('messages:discriminatorRequired')),
    );
  }
};

const validateBody = (req, res, next) => {
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

module.exports = {
  validateBody,
  validateIf,
};
