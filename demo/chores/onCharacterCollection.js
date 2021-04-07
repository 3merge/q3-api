const cluster = require('cluster');

module.exports = async () => {
  console.log(cluster.worker.id);
};
