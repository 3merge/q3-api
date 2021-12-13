require('dotenv').config();

process.env.PURPOSE = 'queue';

const fs = require('fs');
const path = require('path');

const Scheduler = require('q3-core-scheduler');
const cluster = require('cluster');
const core = require('./config/core');
const mongooseInstance = require('./config/mongoose');

const connectToMongooseInstanceWithDefaultPoolSize = () =>
  mongooseInstance.connect(process.env.CONNECTION);

const forkForEachScheduledPriorityLevel = () =>
  Array.from({ length: 3 }).forEach(cluster.fork);

module.exports = async (location) => {
  const models = path.join(location, './models');

  // eslint-disable-next-line
  if (fs.existsSync(models)) require(models);

  await connectToMongooseInstanceWithDefaultPoolSize();
  core(location);

  if (cluster.isMaster) {
    // eslint-disable-next-line
    await require('q3-plugin-changelog/lib/changestream')(
      location,
    );

    await Scheduler.seed(location);
    forkForEachScheduledPriorityLevel();
  } else {
    await Scheduler.start(location, cluster.worker.id);

    // eslint-disable-next-line
    console.log(`Queued on worker #${cluster.worker.id}`);
  }
};
