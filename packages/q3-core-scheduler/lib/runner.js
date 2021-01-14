const path = require('path');
const { readdirSync } = require('fs');
const session = require('q3-core-session');
const { isRecurringJob, parse } = require('./utils');

module.exports = (directory) => {
  const root = path.resolve(directory, './chores');

  return {
    execute: async ({ name, payload = {} }) => {
      // eslint-disable-next-line
      const fn = require(path.join(root, name));
      const data = parse(payload);

      return session.hydrate({ __$q3: data.session }, () =>
        fn(data),
      );
    },

    walk: () =>
      readdirSync(root).reduce(
        (acc, dirent) =>
          isRecurringJob(dirent) ? acc.concat(dirent) : acc,
        [],
      ),
  };
};
