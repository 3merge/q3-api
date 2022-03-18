const notify = require('./notify');
const plugin = require('./plugin');
const {
  castId,
  decorateQueuedFunction,
  getId,
  getWebAppUrlAsTenantUser,
} = require('./utils');

module.exports = {
  notify,
  plugin,

  utils: {
    // everything else internal funcs
    castId,
    decorateQueuedFunction,
    getId,
    getWebAppUrlAsTenantUser,
  },
};
