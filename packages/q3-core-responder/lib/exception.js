/* eslint-disable no-unused-vars, max-classes-per-file */

const retrieveStatusMeta = (code) =>
  Object.entries({
    BadRequest: 400,
    Authentication: 401,
    Authorization: 403,
    ResourceNotFound: 404,
    Conflict: 409,
    Gone: 410,
    Preprocessing: 412,
    Validation: 422,
  }).find(([k, v]) => k === code || v === code) || [
    'InternalServer',
    500,
  ];

const getErrorMessage = (e) => {
  const isObject = (o) => typeof o === 'object';
  const isNull = (o) => o === null;

  if (isObject(e) && !isNull(e)) {
    if ('properties' in e) return e.properties.message;
    if ('msg' in e) return e.msg;
    if ('message' in e) return e.message;
  }

  return e;
};

class Exception {
  constructor(code) {
    const [name, statusCode] = retrieveStatusMeta(code);
    this.code = code;
    this.name = name;
    this.statusCode = statusCode;
    this.errors = {};
  }

  get $error() {
    const e = new Error();
    Object.assign(e, this);
    return e;
  }

  field(fieldName) {
    const formatAPIError = (name, msg, value) => {
      this.errors[name] = {
        msg: msg || name,
        in: 'application',
        value,
      };
    };

    const getFieldNameProps = (name) => {
      if (typeof fieldName === 'object')
        return [
          name || fieldName.name,
          fieldName.msg,
          fieldName.value,
        ];

      return [fieldName];
    };

    if (
      typeof fieldName === 'string' ||
      !Array.isArray(fieldName.name)
    )
      formatAPIError(...getFieldNameProps());

    if (Array.isArray(fieldName.name))
      fieldName.name.forEach((i) => {
        formatAPIError(...getFieldNameProps(i));
      });

    return this;
  }

  msg(msg) {
    this.message = msg;
    this.code = msg;
    return this;
  }

  boomerang() {
    return this.$error;
  }

  log() {
    // eslint-disable-next-line
    console.log(this.$error);
  }

  throw() {
    throw this.$error;
  }
}

const handleUncaughtExceptions = (err, req, res, next) => {
  // eslint-disable-next-line
  if (process.env.DEBUG_CONTROLLER) console.log(err);

  const status = err.statusCode || 500;
  const setHeader = (code) =>
    !res._headerSent && !res.headersSent
      ? res.status(code)
      : undefined;

  const translateMessage = (m) =>
    req.t ? req.t(`messages:${m}`) : m;

  const translateErrors = (e = {}) =>
    Object.entries(e).reduce(
      (a, [key, value]) =>
        req.t
          ? Object.assign(a, {
              [key]: {
                ...value,
                msg: req.t(
                  `errors:${getErrorMessage(value)}`,
                ),
              },
            })
          : a,
      {},
    );

  if (process.env.NODE_ENV === 'production')
    // eslint-disable-next-line
    delete err.stack;

  if (err.errors)
    Object.assign(err, {
      errors: translateErrors(err.errors),
    });

  if (
    err.errors &&
    Object.keys(err.errors).length &&
    status === 500
  ) {
    setHeader(422);
    res.json({
      ...err,
      message: translateMessage('validation'),
    });
  } else {
    setHeader(status);

    res.json({
      ...err,
      message: translateMessage(err.message),
      name: err.name,
    });
  }
};

module.exports = {
  exception: (v) => new Exception(v),
  handleUncaughtExceptions,
};
