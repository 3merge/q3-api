/* eslint-disable import/no-extraneous-dependencies, no-console */
require('dotenv').config();

const Q3 = require('q3-api');
const walker = require('q3-core-walker');
const {
  Scheduler,
  Logger,
  listen,
} = require('q3-core-mailer');

const EVENT_NAME = 'onRoutine';

// process.env.DEBUG = true;

Logger.onEventAsync(EVENT_NAME, async () => {
  console.log('here!');
  const fn = listen(Q3.Users, 'http://localhost', {});

  await fn(EVENT_NAME, null);
});

Q3.config().routes(walker(__dirname));
Q3.connect()
  .then(() => Scheduler.add(EVENT_NAME, '*/10 * * * * *'))
  .then(() => Scheduler.init())
  .then(() =>
    Q3.Users.findOneAndUpdate(
      { email: 'mibberson@3merge.ca' },
      {
        verified: true,
        active: true,
        $addToSet: {
          listens: [EVENT_NAME],
        },
      },
      { new: true },
    ),
  )
  .then(() => {
    // noop
  });

module.exports = Q3.$app;
