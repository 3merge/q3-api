/* eslint-disable global-require */
module.exports = (m) => {
  m.plugin(require('./commons'));
  m.plugin(require('./access'));
  m.plugin(require('./autopopulate'));
  m.plugin(require('./locking'));
};
