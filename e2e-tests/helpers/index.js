/* eslint-disable global-require */
module.exports = {
  ...require('./events'),
  access: require('./access'),
  teardown: require('./teardown'),
};
