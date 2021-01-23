const session = require('q3-core-session');
const { get } = require('lodash');
const { composeAsync } = require('../utils');

const makeSessionObject = (data) => ({
  __$q3: get(data, 'data.session'),
});

module.exports = (...fns) => (data) =>
  session.hydrate(makeSessionObject(data), async () =>
    composeAsync(...fns)(data),
  );
