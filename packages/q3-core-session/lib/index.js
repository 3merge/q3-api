const { createNamespace } = require('cls-hooked');

const {
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
  set: ns.set.bind(ns),

  get: (keyName, propertyPath, defaultValue) => {
    const v = ns.get(keyName);
    if (!v) return defaultValue;
    return getIn(v, propertyPath);
  },

  middleware: (req, res, next) =>
    ns.run(() => {
      const getFromReq = (path) =>
        isObject(req) ? req[path] : undefined;

      const user = getFromReq('user');
      const headers = getFromReq('headers');
      const defaultTenant = isObject(headers)
        ? headers['x-session-tenant']
        : undefined;

      ns.set(SESSION_KEY, user);
      ns.set(
        TENANT_KEY,
        isObject(user) ? user.tenant : defaultTenant,
      );

      if (req && !req.session)
        req.session = {
          [SESSION_KEY]: user,
        };

      Promise.all(execMap(req)).then(() => {
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

  hydrate: (ctx = {}, done) =>
    new Promise((resolve, reject) => {
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
    }),
};
