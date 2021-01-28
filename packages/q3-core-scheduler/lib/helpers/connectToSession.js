const session = require('q3-core-session');
const { get } = require('lodash');
const { composeAsync } = require('../utils');

const makeSessionObject = (data) => ({
  __$q3: get(data, 'data.session'),
});

module.exports = (...fns) => (data) => {
  // strangely, the errors will not bubble to the top otherwise
  // must have something to do with the hydration process
  let outside;

  return session
    .hydrate(makeSessionObject(data), () =>
      composeAsync(...fns)(data).catch((e) => {
        outside = e;
        return Promise.reject(e);
      }),
    )
    .catch(() => Promise.reject(outside));
};
