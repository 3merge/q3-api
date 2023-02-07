const { __$db: Model } = require('q3-core-scheduler');
const moment = require('moment');
const { lowerCase } = require('lodash');

module.exports = async () => {
  let [interval, unit] = String(
    process.env.QUEUING_LIFETIME || '1_YEARS',
  ).split('_');

  interval = Number(interval);
  unit = lowerCase(unit);

  if (
    !Number.isNaN(interval) &&
    ['years', 'months', 'weeks', 'days'].includes(unit)
  )
    await Model.deleteMany({
      due: {
        $lt: moment().subtract(interval, unit).toDate(),
      },
    });
};
