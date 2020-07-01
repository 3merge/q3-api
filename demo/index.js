const Q3 = require('q3-api');
const config = require('./config');
require('./models');

process.env.CONNECTION = 'mongodb://localhost:27017/q3';
process.env.PORT = 9000;

config
  .connect()
  .then(() =>
    Q3.Users.findOneAndUpdate(
      { email: 'mibberson@3merge.ca' },
      {
        role: 'Dev',
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
