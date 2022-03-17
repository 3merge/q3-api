const notify = require('./notify');
const plugin = require('./plugin');
const {
  decorateQueuedFunction,
  getWebAppUrlAsTenantUser,
} = require('./utils');

module.exports = {
  notify,
  plugin,

  utils: {
    // everything else internal funcs
    decorateQueuedFunction,
    getWebAppUrlAsTenantUser,
  },
};
