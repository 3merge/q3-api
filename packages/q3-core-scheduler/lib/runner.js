const path = require('path');
const { readdirSync } = require('fs');
const { isRecurringJob, parse } = require('./utils');

module.exports = (directory) => {
  const root = path.resolve(directory, './chores');

  return {
    execute: async ({ name, payload = {} }) => {
      // eslint-disable-next-line
      const fn = require(path.join(root, name));
      await fn(parse(payload));
    },

    walk: () =>
      readdirSync(root).reduce(
        (acc, dirent) =>
          isRecurringJob(dirent) ? acc.concat(dirent) : acc,
        [],
      ),
  };
};
