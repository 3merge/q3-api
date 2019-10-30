const ctx = require('request-context');
const { ERRORS, CONTEXT } = require('./constants');

class ErrorDispatch {
  constructor(name) {
    this.dp = ctx.get(CONTEXT.LOCALE) || {
      t: (v) => v,
    };

    this.errors = {};
    this.id = '';

    this.name =
      Object.values(ERRORS).find((key) =>
        key.includes(name),
      ) || 'InternalServerError';
  }

  get $error() {
    const e = new Error(this.id);
    e.errors = this.errors;
    e.name = this.name;
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
    if (this.dp) {
      this.id = this.dp.t(`errors:${msg}`);
    } else {
      this.id = msg;
    }

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

// keep a singleton for chaining
module.exports = (name) => new ErrorDispatch(name);
