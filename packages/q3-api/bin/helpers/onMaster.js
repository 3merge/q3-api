const cluster = require('cluster');

module.exports = async (callback) => {
  if (cluster.isMaster) await callback();
};
