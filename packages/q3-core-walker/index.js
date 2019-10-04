const { Router } = require('express');
const { readdirSync } = require('fs');
const { resolve, relative, join } = require('path');

/** 
Q3Api.walk = (dir) => {
  const workingDir = process.cwd();
  app.use(
    parser(dir ? path.join(workingDir, dir) : workingDir),
  );
}; */

const appendID = (str) => `:${str}ID`;

const appendIDToLast = (p, i, c) =>
  i === c.length - 1 ? p : `${p}/${appendID(p)}`;

const getNestedPath = (sub, name = '') => {
  const arr = sub.split('\\').map(appendIDToLast);
  if (name.includes('.id.')) {
    arr.push(appendID(arr[arr.length - 1]));
  }

  return arr.join('/');
};

const getVerb = (name) => {
  const [verb] = name.split('.');
  if (
    !['post', 'put', 'patch', 'get', 'delete'].includes(
      verb,
    )
  ) {
    return 'use';
  }

  return verb;
};

class DirectoryWalker {
  constructor(src) {
    this.root = src;
  }

  setContext(dir, name) {
    Object.assign(this, {
      dir,
      name,
    });
  }

  getController() {
    try {
      // eslint-disable-next-line
      const controller = require(resolve(this.dir, this.name));
      if (typeof controller !== 'function') {
        throw new Error('Controller must be a function');
      }

      // eslint-disable-next-line
      console.log(`Registering ${this.name} in ${this.dir}`);
      return controller;
    } catch (err) {
      return null;
    }
  }

  getSlug() {
    return `/${getNestedPath(
      relative(this.root, this.dir),
      this.name,
    )}`;
  }

  exec(app) {
    const ctrl = this.getController();
    const verb = getVerb(this.name);
    if (ctrl && verb in app)
      app[verb](...[this.getSlug(), ctrl]);
  }
}

module.exports = (root) => {
  const app = new Router();
  const opts = { withFileTypes: true };

  const recursive = (dir) =>
    readdirSync(dir, opts).forEach((dirent) => {
      const { name } = dirent;
      const builder = new DirectoryWalker(root);
      builder.setContext(dir, name);
      builder.exec(app);

      if (dirent.isDirectory()) {
        recursive(join(dir, name));
      }
    });

  try {
    recursive(root);
    return app;
  } catch (err) {
    return app;
  }
};
