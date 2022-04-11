const { createNamespace } = require('cls-hooked');

const {
  ORIGIN,
  SESSION_NAMESPACE,
  SESSION_KEY,
  TENANT_KEY,
} = require('./constants');

const ev = {};
const ns = createNamespace(SESSION_NAMESPACE);

const clearNs = (key) => ns.set(key, undefined);
const isObject = (v) => typeof v === 'object' && v !== null;

const execMap = (d) =>
  Object.entries(ev).map(async ([key, fn]) => {
    const val = await fn(d);

    if (isObject(d) && isObject(d.session))
      // eslint-disable-next-line
      d.session[key] = val;

    return ns.set(key, val);
  });

const clearMap = () =>
  Object.keys(ev).map(async (key) => {
    clearNs(key);
  });

const getIn = (obj, v) =>
  isObject(obj) && typeof v === 'string'
    ? v
        .split('.')
        .reduce(
          (curr, next) =>
            isObject(curr) ? curr[next] : obj,
          obj,
        )
    : obj;

module.exports = {
  runPromise: ns.runPromise.bind(ns),
  set: ns.set.bind(ns),

  getActiveContext: () => ns.active,

  get: (keyName, propertyPath, defaultValue) => {
    const v = ns.get(keyName);
    if (!v) return defaultValue;
    return getIn(v, propertyPath);
  },

  middleware: (req, res, next) =>
    ns.runPromise(async () => {
      const getFromReq = (path) =>
        isObject(req) ? req[path] : undefined;

      const user = getFromReq('user');
      const tenant = getFromReq('tenant');
      const { active } = ns;

      ns.set(SESSION_KEY, user);
      ns.set(TENANT_KEY, tenant);
      ns.set(ORIGIN, getFromReq('originalUrl'));

      if (req) {
        if (!req.session)
          req.session = {
            [SESSION_KEY]: user,
            [TENANT_KEY]: tenant,
          };

        // ensures that the active context doesn't
        // get duplicated and pollute the underlying .Map
        req.bindPromise = (fn) => ns.bind(fn, active)();
      }

      await Promise.all(execMap(req)).then(() => {
        if (typeof getFromReq('onSession') === 'function') {
          req.onSession(req, res, next);
        } else {
          next();
        }
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
      .concat([ORIGIN, SESSION_KEY, TENANT_KEY])
      .reduce(
        (curr, key) =>
          Object.assign(curr, {
            [key]: ns.get(key),
          }),
        {},
      ),

  kill: () => {
    clearMap();
    clearNs(ORIGIN);
    clearNs(SESSION_KEY);
    clearNs(TENANT_KEY);
  },

  intercept: (keyName, fn) => {
    ev[keyName] = fn;
  },

  hydrate: (ctx = {}, done) => {
    // eslint-disable-next-line
    console.warn(
      'This method has been deprecated. Please use `connect` instead.',
    );

    return new Promise((resolve, reject) => {
      ns.run(async () => {
        try {
          if ('__$q3' in ctx && isObject(ctx.__$q3))
            Object.entries(ctx.__$q3).forEach(
              ([key, value]) => {
                ns.set(key, value);
              },
            );

          await done();
          resolve();
        } catch (e) {
          reject();
        }
      });
    });
  },

  connect(fn) {
    return function connectToActiveContext(...params) {
      return ns.bind(fn, this.__$q3)(...params);
    };
  },
};
