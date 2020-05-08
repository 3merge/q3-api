const Q3 = require('q3-api');
const access = require('./access.json');
const messages = require('./messages.json');
require('./models');

process.env.CONNECTION = 'mongodb://localhost:27017/q3';
process.env.PORT = 9000;

Q3.config({
  messages,
  chores: {
    from: 'support@3merge.ca',
    strategy: 'Mailgun',
  },
})
  .protect(access)
  .routes()
  .connect()
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
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e);
  });

module.exports = Q3.$app;
