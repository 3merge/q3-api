const { ERRORS } = require('./constants');

class ErrorByName {
  constructor(name) {
    const err = Object.entries(ERRORS).filter(([key]) =>
      key.includes(name),
    );

    this.Err = err ? err[1] : Error;
  }

  exec(...args) {
    return this.Err(...args);
  }
}

const boomerang = (name, ...args) =>
  new ErrorByName(name).exec(...args);

const toss = (name, ...args) =>
  throw new ErrorByName(name).exec(...args);

const log = (name, ...args) =>
  // eslint-disable-next-line
  console.log(new ErrorByName(name).exec(...args));

module.exports = (name) => ({
  boomerang: boomerang(name),
  throw: toss(name),
  log: log(name),
});
