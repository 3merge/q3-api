const core = require('./core');
const plugin = require('./plugin');

module.exports = {
  plugin,
  ...core,
};
