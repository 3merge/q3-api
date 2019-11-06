/* eslint-disable global-require */
module.exports = (m) => {
  m.plugin(require('./commons'));
  m.plugin(require('./access'));
};
