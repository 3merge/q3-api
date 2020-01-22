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
      ns.set(SESSION_KEY, req.user);
      next();
    }),

  kill: () => {
    ns.set(SESSION_KEY, undefined);
    destroyNamespace(SESSION_NAMESPACE);
  },
};
