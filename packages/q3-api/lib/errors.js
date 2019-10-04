const ctx = require('request-context');
const { ERRORS, CONTEXT } = require('./constants');

class ErrorDispatch {
  constructor(name) {
    this.dp = ctx.get(CONTEXT.LOCALE);
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
    this.errors[fieldName] = this.dp.t(
      `validations:${fieldName}`,
    );
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

// keep a singleton for chaining
module.exports = (name) => new ErrorDispatch(name);
