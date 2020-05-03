require('dotenv').config();
const Q3 = require('q3-api');
const walker = require('q3-core-walker');
const { Scheduler } = require('q3-core-mailer');

require('./events');

Q3.config().routes(walker(__dirname));
Q3.connect()
  .then(() => Scheduler.add('onRoutine', '*/10 * * * * *'))
  .then(() => Scheduler.init())
  .then(() =>
    Q3.Users.findOneAndUpdate(
      { email: 'mibberson@3merge.ca' },
      {
        verified: true,
        active: true,
        $addToSet: {
          listens: [],
        },
      },
      { new: true },
    ),
  )
  .then(() => {
    // noop
  });

module.exports = Q3.$app;
