/* eslint-disable no-unused-vars */
const ctx = require('request-context');
const i18n = require('i18next');

const executeTranslation = (
  name,
  sessionVar = 'q3-session:locale',
) => {
  const locale = ctx.get(sessionVar);
  if (locale) return locale.t(name);
  if (i18n.exists(name)) return i18n.t(name);
  return name;
};

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

class Exception {
  constructor(code) {
    const [name, statusCode] = retrieveStatusMeta(code);
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
      const format = `validations:${msg || name}`;
      this.errors[name] = {
        msg: executeTranslation(format),
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
    this.message = executeTranslation(`errors:${msg}`);
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
  const setHeader = (code) =>
    !res._headerSent && !res.headersSent
      ? res.status(code)
      : undefined;

  if (
    err.errors &&
    Object.keys(err.errors).length &&
    status === 500
  ) {
    setHeader(422);
    res.json({
      message: req.t('messages:validation'),
      ...err,
    });
  } else {
    setHeader(status);
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
