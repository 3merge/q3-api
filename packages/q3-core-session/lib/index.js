const {
  createNamespace,
  destroyNamespace,
} = require('cls-hooked');

const {
  SESSION_NAMESPACE,
  SESSION_KEY,
} = require('./constants');

const ev = {};
const ns = createNamespace(SESSION_NAMESPACE);

const clearNs = (key) => ns.set(key, undefined);
const isObject = (v) => typeof v === 'object' && v !== null;

const execMap = (d) =>
  Object.entries(ev).map(async ([key, fn]) =>
    ns.set(key, await fn(d)),
  );

const clearMap = () =>
  Object.keys(ev).map(async (key) => {
    clearNs(key);
    delete ev[key];
  });

const getIn = (obj, v) =>
  isObject(obj) && typeof v === 'string'
    ? v.split('.').reduce((curr, next) => {
        return isObject(curr) ? curr[next] : obj;
      }, obj)
    : obj;

module.exports = {
  set: ns.set.bind(ns),

  get: (keyName, propertyPath, defaultValue) => {
    const v = ns.get(keyName);
    if (!v) return defaultValue;
    return getIn(v, propertyPath);
  },

  middleware: (req, res, next) =>
    ns.run(() => {
      ns.set(
        SESSION_KEY,
        isObject(req) ? req.user : undefined,
      );

      Promise.all(execMap(req)).then(() => {
        next();
      });
    }),

  nx: (keyName, value) => {
    const exists = ns.get(keyName);
    if (exists) return exists;
    if (value instanceof Promise)
      return value.then((res) => {
        ns.set(keyName, res);
        return res;
      });

    ns.set(keyName, value);
    return value;
  },

  getAll: () =>
    Object.keys(ev)
      .concat(SESSION_KEY)
      .reduce(
        (curr, key) =>
          Object.assign(curr, {
            [key]: ns.get(key),
          }),
        {},
      ),

  kill: () => {
    clearMap();
    clearNs(SESSION_KEY);
  },

  intercept: (keyName, fn) => {
    ev[keyName] = fn;
  },
};
