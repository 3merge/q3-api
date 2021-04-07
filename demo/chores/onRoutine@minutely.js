const cluster = require('cluster');

module.exports = async function onRoutine() {
  // eslint-disable-next-line
  console.log(cluster.worker.id);
  return this;
};
