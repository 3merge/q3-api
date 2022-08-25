/* eslint-disable global-require,import/no-dynamic-require */
const path = require('path');
const { readdirSync } = require('fs');
const {
  isRecurringJob,
  forwardPayload,
} = require('./utils');
const {
  connectToFileStorage,
  connectToQueryParser,
  connectToSession,
} = require('./helpers');

module.exports = (directory) => {
  const root = path.resolve(directory, './chores');

  const getFunctionFromFileSystem = (name) => {
    try {
      try {
        return require(path.join(root, name));
      } catch (e) {
        return require(path.join(
          process.cwd(),
          `node_modules/q3-api/lib/chores/${name}`,
        ));
      }
    } catch (e) {
      console.log(e);
      throw new Error(`${name} missing from file system`);
    }
  };

  const invokeRequireOnDirectoryPath = ({
    attachments,
    name,
    data,
  }) =>
    getFunctionFromFileSystem(name)(
      connectToQueryParser(data),
      attachments,
    );

  return {
    // mainly just for testing
    getFunctionFromFileSystem,

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
