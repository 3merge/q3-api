require('dotenv').config();
const mongooseInstance = require('q3-api/lib/config/mongoose');
const Scheduler = require('q3-core-scheduler');

module.exports = (location) =>
  mongooseInstance
    .connect(process.env.CONNECTION)
    .then(() => Scheduler.seed(location))
    .then(() => Scheduler.start(location))
    .then(() => {
      if (process.env.NODE_ENV !== 'production')
        // eslint-disable-next-line
        console.log('Started queuing service');
    });
