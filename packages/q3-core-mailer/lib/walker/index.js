const Scheduler = require('q3-core-scheduler');

module.exports = async (dir) => {
  await Scheduler.seed(dir);
  return Scheduler.start(dir);
};
