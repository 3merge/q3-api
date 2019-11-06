const get = require('lodash.get');

const methods = ['get', 'put', 'patch', 'delete', 'update'];

module.exports = (app, { path, method, handle }) => {
  if (!app || !('stack' in app))
    throw new Error('Stack unavailable');

  if (!path || !path.startsWith('/'))
    throw new Error('Path invalid');

  if (!methods.includes(method))
    throw new Error('Method invalid');

  if (typeof handle !== 'function')
    throw new Error('Handle invalid');

  app.stack.forEach((s) => {
    if (get(s, 'route.path') === path) {
      get(s, 'route.stack', []).forEach((n) => {
        if (get(n, 'method') === method) {
          Object.assign(n, {
            handle,
          });
        }
      });
    }
  });
};
