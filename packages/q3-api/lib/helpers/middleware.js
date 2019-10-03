const customErrorMatcher = require('./errors');
const { translate } = require('../config/i18next');

const statusCodeHelper = (res) => (code) => (body = {}) => {
  res.status(code).json(body);
};

const decorateResponse = (req, res, next) => {
  const dispatch = statusCodeHelper(res);
  req.translate = translate;
  // @TODO MMS integration
  // eslint-disable-next-line
  req.message = console.log;
  res.acknowledge = dispatch(204);
  res.ok = dispatch(200);
  res.update = dispatch(200);
  res.create = dispatch(201);
  next();
};

// eslint-disable-next-line
decorateResponse.handleUncaughtErrors = (err, req, res, next) => {
  const status = customErrorMatcher(err.name);
  res.status(status);
  if (status !== 500) {
    res.json(err);
  } else {
    res.json({
      message: err.message,
      trace: err.trace,
    });
  }
};

module.exports = decorateResponse;
