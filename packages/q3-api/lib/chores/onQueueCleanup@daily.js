const { __$db: Model } = require('q3-core-scheduler');
const moment = require('moment');

module.exports = async () => {
  const [interval, unit] = String(
    process.env.QUEUING_COLLECTION || '1_YEAR',
  ).split('_');

  await Model.deleteMany({
    due: {
      $lt: moment().subtract(interval, unit).toDate(),
    },
  });
};
