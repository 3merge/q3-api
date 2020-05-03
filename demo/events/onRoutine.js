const Q3 = require('q3-api');
const { Logger, listen } = require('q3-core-mailer');

const EVENT_NAME = 'onRoutine';

module.exports = Logger.onEventAsync(
  EVENT_NAME,
  async () => {
    const fn = listen(Q3.Users, 'http://localhost', {});
    await fn(EVENT_NAME, null);
    // eslint-disable-next-line
    console.log('Ran event:', EVENT_NAME);
  },
);
