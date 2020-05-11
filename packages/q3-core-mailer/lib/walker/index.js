const { readdirSync } = require('fs');
const path = require('path');
const Logger = require('../logger');
const Scheduler = require('../scheduler');

const isListener = (v) =>
  typeof v === 'string' && v.startsWith('on');

const convertToInterval = (value) => {
  switch (value) {
    case 'annually':
      return '* * * */12 *';
    case 'biannually':
      return '* * * */6 *';
    case 'quarterly':
      return '* * * */4 *';
    case 'monthly':
      return '* * * */1 *';
    case 'weekly':
      return '* * */7 * *';
    case 'daily':
      return '* */24 * * *';
    case 'bihourly':
      return '* */2 * * *';
    case 'hourly':
      return '* 1 * * *';
    case 'semihourly':
      return '*/3 * * * *';
    case 'biminutely':
      return '*/2 * * * *';
    case 'minutely':
      return '* * * * *';
    default:
      return null;
  }
};

const setupEvent = async (eventName, interval, handler) => {
  await Logger.onEventAsync(eventName, handler);
  if (interval) await Scheduler.add(eventName, interval);
};

const walker = async (dir) => {
  const root = path.resolve(dir, './chores');

  const getFn = (dirent) =>
    // eslint-disable-next-line
    require(path.join(root, dirent));

  const getEvent = async (dirent) => {
    const f = path.basename(dirent, path.extname(dirent));
    const [eventName, interval] = f.split('@');

    if (isListener(eventName))
      await setupEvent(
        eventName,
        convertToInterval(interval),
        getFn(dirent),
      );
  };

  readdirSync(root).forEach(getEvent);
  await Scheduler.init();
};

module.exports = walker;
walker.convertToInterval = convertToInterval;
walker.setupEvent = setupEvent;
