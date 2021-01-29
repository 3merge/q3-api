const { AccessControl } = require('q3-core-access');
const locale = require('q3-locale');

module.exports = (dir) => {
  AccessControl.init(dir);
  locale(dir);
};
