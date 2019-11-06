class ErrorDispatch {
  constructor(name) {
    this.name = name;
  }

  get $error() {
    return new Error(this.name);
  }

  field() {
    return this;
  }

  msg() {
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
