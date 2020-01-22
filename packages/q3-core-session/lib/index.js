const {
  createNamespace,
  destroyNamespace,
} = require('cls-hooked');

const {
  SESSION_NAMESPACE,
  SESSION_KEY,
} = require('./constants');

const ns = createNamespace(SESSION_NAMESPACE);

module.exports = {
  get: ns.get.bind(ns),
  set: ns.set.bind(ns),

  middleware: (req, res, next) =>
    ns.run(() => {
      ns.set(
        SESSION_KEY,
        typeof req === 'object' && req !== null
          ? req.user
          : undefined,
      );

      next();
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
    ns.set(SESSION_KEY, undefined);
    destroyNamespace(SESSION_NAMESPACE);
  },
};
