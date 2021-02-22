require('dotenv').config();

process.env.PURPOSE = 'queue';

const locale = require('q3-locale');
const Scheduler = require('q3-core-scheduler');
const core = require('./config/core');
const mongooseInstance = require('./config/mongoose');

module.exports = (location) => {
  const invokeWithLocation = (fn) => () => fn(location);

  return mongooseInstance
    .connect(process.env.CONNECTION)
    .then(
      // eslint-disable-next-line
      require('q3-plugin-changelog/lib/changestream'),
    )
    .then(invokeWithLocation(core))
    .then(invokeWithLocation(locale))
    .then(invokeWithLocation(Scheduler.seed))
    .then(invokeWithLocation(Scheduler.start))
    .then(() => {
      if (process.env.NODE_ENV !== 'production')
        // eslint-disable-next-line
        console.log('Started queuing service');

      return Scheduler;
    });
};
