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

module.exports = {
  get: ns.get.bind(ns),
  set: ns.set.bind(ns),

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

  kill: () => {
    try {
      clearMap();
      clearNs(SESSION_KEY);
      destroyNamespace(SESSION_NAMESPACE);
    } catch (e) {
      // noop
    }
  },

  intercept: (keyName, fn) => {
    ev[keyName] = fn;
  },
};
