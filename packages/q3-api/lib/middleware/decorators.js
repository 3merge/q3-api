const statusCodeHelper = (res) => (code) => (body = {}) => {
  res.status(code).json(body);
};

const detectErrorByName = (name) => {
  switch (name) {
    case 'BadRequestError':
      return 400;
    case 'AuthenticationError':
      return 401;
    case 'AuthorizationError':
      return 403;
    case 'ResourceNotFoundError':
      return 404;
    case 'ValidationError':
      return 422;
    case 'ConflictError':
      return 409;
    default:
      return 500;
  }
};

const decorateResponse = (req, res, next) => {
  const dispatch = statusCodeHelper(res);
  res.acknowledge = dispatch(204);
  res.ok = dispatch(200);
  res.update = dispatch(200);
  res.create = dispatch(201);
  next();
};

// eslint-disable-next-line
decorateResponse.handleUncaughtErrors = (err, req, res, next) => {
  const status = detectErrorByName(err.name);
  res.status(status);

  if (err.errors && Object.keys(err.errors).length) {
    res.status(422).json({
      message: req.t('messages:validationError'),
      ...err,
    });
  } else if (status !== 500) {
    res.json(err);
  } else {
    res.json({
      message: err.message,
      trace: err.trace,
    });
  }
};

module.exports = decorateResponse;
