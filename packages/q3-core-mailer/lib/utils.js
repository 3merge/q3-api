const { readdirSync } = require('fs');
const path = require('path');
const Emitter = require('./emitter');

const isValidEmailAddress = (v) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(v).toLowerCase(),
  );

exports.filterByEmailValidity = (a = []) =>
  a
    .map((v) => v.trim())
    .filter(isValidEmailAddress)
    .join(', ');

exports.prefix = (args) =>
  Object.entries(args).reduce(
    (acc, [key, value]) =>
      Object.assign(acc, { [`v:${key}`]: value }),
    {},
  );

exports.discoverEmailListenersInDir = (dir) => {
  readdirSync(dir).forEach((dirent) => {
    const f = path.basename(dirent, path.extname(dirent));
    if (f.startsWith('on'))
      // eslint-disable-next-line
      Emitter.on(f, require(path.join(dir, dirent)));
  });
};
