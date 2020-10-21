const { readdirSync } = require('fs');
const path = require('path');
const { isListener } = require('../helpers');
const Scheduler = require('../model');

module.exports = (rootDirectory) =>
  readdirSync(rootDirectory).forEach(async (dirent) => {
    const f = path.basename(dirent, path.extname(dirent));
    const [eventName, interval] = f.split('@');

    if (isListener(eventName))
      await Scheduler.add(eventName, interval);
  });
