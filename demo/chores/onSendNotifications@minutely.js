const Q3 = require('q3-api');
const session = require('q3-core-session');

module.exports = () => {
  session.set('USER', {
    _id: Q3.$mongoose.Types.ObjectId(
      '5f0494495edf2041ac944aed',
    ),
  });

  return Q3.saveToSessionNotifications('testing');
};
