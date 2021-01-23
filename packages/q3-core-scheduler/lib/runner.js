const path = require('path');
const { readdirSync } = require('fs');
const {
  isRecurringJob,
  forwardPayload,
} = require('./utils');
const {
  connectToFileStorage,
  connectToSession,
} = require('./helpers');

module.exports = (directory) => {
  const root = path.resolve(directory, './chores');

  const invokeRequireOnDirectoryPath = ({
    attachments,
    name,
    data,
    // eslint-disable-next-line
  }) => require(path.join(root, name))(data, attachments);

  return {
    execute: forwardPayload(
      connectToSession(
        invokeRequireOnDirectoryPath,
        connectToFileStorage,
      ),
    ),

    walk: () =>
      readdirSync(root).reduce(
        (acc, dirent) =>
          isRecurringJob(dirent) ? acc.concat(dirent) : acc,
        [],
      ),
  };
};
