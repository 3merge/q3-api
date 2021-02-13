require('dotenv').config();

process.env.PURPOSE = 'queue';

const locale = require('q3-locale');
const Scheduler = require('q3-core-scheduler');
const { mongoose } = require('q3-adapter-mongoose');
const core = require('./config/core');

module.exports = (location) => {
  const invokeWithLocation = (fn) => () => fn(location);

  return mongoose
    .connect(process.env.CONNECTION)
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
