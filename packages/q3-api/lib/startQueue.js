require('dotenv').config();
const Scheduler = require('q3-core-scheduler');
const mongooseInstance = require('./config/mongoose');

module.exports = (location) =>
  mongooseInstance
    .connect(process.env.CONNECTION)
    .then(() => Scheduler.seed(location))
    .then(() => Scheduler.start(location))
    .then(() => {
      if (process.env.NODE_ENV !== 'production')
        // eslint-disable-next-line
        console.log('Started queuing service');

      return Scheduler;
    });
