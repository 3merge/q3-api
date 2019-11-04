/* eslint-disable no-unused-vars */
const ctx = require('request-context');
const i18n = require('i18next');

const STATUS_CODES = {
  BadRequest: 400,
  Authentication: 401,
  Authorization: 403,
  ResourceNotFound: 404,
  Conflict: 409,
  Gone: 410,
  Validation: 422,
};

class Exception {
  constructor(code) {
    /**
     * @NOTE
     * Dependency injection
     * Defaults to base instance.
     */
    this.dp = ctx.get('q3-session:locale') || i18n;
    this.errors = {};

    const err = Object.entries(STATUS_CODES).find(
      ([k, v]) => k === code || v === code,
    );

    const [name, statusCode] = err || [
      'InternalServer',
      500,
    ];

    this.name = this.dp.t(`messages:${name}`);
    this.statusCode = statusCode;
  }

  get $error() {
    const e = new Error(this.name);
    e.statusCode = this.statusCode;
    e.errors = this.errors;
    return e;
  }

  field(fieldName) {
    const asServerError = (v) => ({
      msg: this.dp.t(`validations:${v}`),
      in: 'application',
    });

    if (typeof fieldName === 'object') {
      const { name, msg, value } = fieldName;
      this.errors[name] = {
        ...asServerError(msg),
        value,
      };
    } else {
      this.errors[fieldName] = {
        msg: asServerError(fieldName),
      };
    }

    return this;
  }

  msg(msg) {
    this.id = this.dp.t(`errors:${msg}`);
    return this;
  }

  boomerang() {
    return this.$error;
  }

  log() {
    // eslint-disable-next-line
    console.log(this.$error)
  }

  throw() {
    throw this.$error;
  }
}

const handleUncaughtExceptions = (err, req, res, next) => {
  const status = err.statusCode || 500;

  if (!res._headerSent && !res.headersSent)
    res.status(status);

  if (
    err.errors &&
    Object.keys(err.errors).length &&
    status === 500
  ) {
    res.status(422).json({
      message: req.t('messages:Validation'),
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

module.exports = {
  exception: (v) => new Exception(v),
  handleUncaughtExceptions,
};
