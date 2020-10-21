const moment = require('moment');
const cron = require('node-cron');
const { readdirSync } = require('fs');
const path = require('path');
const Scheduler = require('../model');

exports.poll = (fn) => cron.schedule('* * * * *', fn);

exports.findJobsInDirectory = (rootDirectory) =>
  readdirSync(rootDirectory).forEach(async (dirent) => {
    const f = path.basename(dirent, path.extname(dirent));
    const [eventName, interval] = f.split('@');

    if (
      typeof eventName === 'string' &&
      eventName.startsWith('on')
    )
      // NEEDS THIS FACADE...
      await Scheduler.add(eventName, interval);
  });

exports.reduceAsync = (fns = []) =>
  fns.reduce((p, fn) => p.then(fn), Promise.resolve());

exports.hasPassed = (value, date) => {
  const shouldRestart = (increment, qualifier) => {
    return date
      ? moment().isSameOrAfter(
          moment(date).add(increment, qualifier),
        )
      : true;
  };

  switch (value) {
    case 'annually':
      return shouldRestart(1, 'years');
    case 'biannually':
      return shouldRestart(2, 'quarters');
    case 'quarterly':
      return shouldRestart(1, 'quarters');
    case 'monthly':
      return shouldRestart(1, 'months');
    case 'weekly':
      return shouldRestart(1, 'weeks');
    case 'daily':
      return shouldRestart(1, 'days');
    case 'bihourly':
      return shouldRestart(2, 'hours');
    case 'hourly':
      return shouldRestart(1, 'hours');
    case 'semihourly':
      return shouldRestart(30, 'minutes');
    case 'biminutely':
      return shouldRestart(2, 'minutes');
    case 'minutely':
      return shouldRestart(1, 'minutes');
    default:
      return false;
  }
};
