const { ERRORS } = require('./constants');

const errorByName = (name, msg, ...args) => {
  const [err] = Object.entries(ERRORS).filter(([key]) =>
    key.includes(name),
  );
  const ErrorInstance = err ? err[1] : Error;
  return new ErrorInstance(msg, ...args);
};

const boomerang = (name) => (msg) => (...args) =>
  errorByName(name, msg, ...args);

const toss = (name) => (msg) => (...args) => {
  throw errorByName(name, msg, ...args);
};

const log = (name) => (msg) => (...args) =>
  // eslint-disable-next-line
  console.log(errorByName(name, msg, ...args));

module.exports = (name) => ({
  msg: (msg) => ({
    boomerang: boomerang(name)(msg),
    throw: toss(name)(msg),
    log: log(name)(msg),
  }),
});
