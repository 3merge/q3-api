const { Types } = require('mongoose');

const statusCodeHelper = (res) => (code) => (body = {}) => {
  res.status(code).json(body);
};

const removeEmpty = (obj = {}) =>
  Object.entries(obj).reduce((a, [key, value]) => {
    const copy = { ...a };
    if (value) copy[key] = value;
    return copy;
  }, {});

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

const stripMongoDBProps = (i) => {
  try {
    const json = removeEmpty(i.toJSON());

    if (json.id && json.id.toString) {
      json.id = json.id.toString();
    }

    delete json._id;
    delete json.__v;

    Object.entries(json).forEach(([k, v]) => {
      if (typeof v !== 'object') return;
      if (v._bsontype === 'ObjectID') {
        json[k] = Types.ObjectId(v).toString();
      } else if (!(v instanceof Date)) {
        json[k] = stripMongoDBProps(v);
      }
    });

    return json;
  } catch (e) {
    return removeEmpty(i);
  }
};

const decorateResponse = (req, res, next) => {
  const dispatch = statusCodeHelper(res);

  req.marshal = (o) =>
    Array.isArray(o)
      ? o.map(stripMongoDBProps)
      : stripMongoDBProps(o);

  res.acknowledge = dispatch(204);
  res.ok = dispatch(200);
  res.update = dispatch(200);
  res.create = dispatch(201);
  next();
};

decorateResponse.handleUncaughtErrors = (
  err,
  req,
  res,
  // eslint-disable-next-line
  next,
) => {
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
