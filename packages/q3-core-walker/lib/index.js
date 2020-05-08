const { Router } = require('express');
const { readdirSync } = require('fs');
const { join } = require('path');
const { sortFiles } = require('./utils');
const DirectoryWalker = require('./walker');

module.exports = (root) => {
  const app = new Router();
  const opts = { withFileTypes: true };
  const workingDir = join(root, './routes');

  const recursive = (dir) =>
    sortFiles(readdirSync(dir, opts)).forEach((dirent) => {
      const { name } = dirent;
      const builder = new DirectoryWalker(workingDir);

      builder.setContext(dir, name);
      builder.exec(app);

      try {
        recursive(join(dir, name));
      } catch (e) {
        // noop
        // @TODO: dirent.isDirectory() UNIX envs
      }
    });

  try {
    recursive(workingDir);
    return app;
  } catch (err) {
    return app;
  }
};
