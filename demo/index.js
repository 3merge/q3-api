/* eslint-disable import/no-extraneous-dependencies, no-console */
require('dotenv').config();

const Q3 = require('q3-api');
const walker = require('q3-core-walker');
const { Scheduler, Logger } = require('q3-core-mailer');

const EVENT_NAME = 'onRoutine';

process.env.DEBUG = true;

Logger.onEventAsync(EVENT_NAME, async () => {
  console.log('here!');
});

Q3.config().routes(walker(__dirname));
Q3.connect()
  .then(() => Scheduler.add(EVENT_NAME, '*/10 * * * * *'))
  .then(() => Scheduler.init())
  .then(() => {
    console.log('Connected to Q3');
  });

module.exports = Q3.$app;
