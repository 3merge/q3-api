const {
  forEach,
  isString,
  isObject,
  get,
  set,
} = require('lodash');

module.exports = (xs, path, fn) => {
  if (!isObject(xs)) return {};
  const execOn = (p) => set(xs, p, fn(get(xs, p)));

  if (Array.isArray(path)) {
    forEach(path, execOn);
  } else if (isString(path)) {
    execOn(path);
  }

  return xs;
};
