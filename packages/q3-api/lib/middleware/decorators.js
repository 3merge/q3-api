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
  req.marshal = (o) =>
    Array.isArray(o)
      ? o.map((i) => i.toJSON())
      : o.toJSON();

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

  if (
    err.errors &&
    Object.keys(err.errors).length &&
    status === 500
  ) {
    res.status(422).json({
      message: req.t('messages:validationError'),
      ...err,
    });
  } else {
    res.json({
      errors: err.errors,
      message: err.message,
      trace: err.trace,
      name: err.name,
    });
  }
};

module.exports = decorateResponse;
