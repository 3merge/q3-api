const { readdirSync } = require('fs');
const path = require('path');
const Logger = require('../logger');
const Scheduler = require('../scheduler');

const isListener = (v) =>
  typeof v === 'string' && v.startsWith('on');

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
      await setupEvent(eventName, interval, getFn(dirent));
  };

  readdirSync(root).forEach(getEvent);
  await Scheduler.init();
};

module.exports = walker;

walker.setupEvent = setupEvent;
