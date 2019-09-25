import { Router } from 'express';
import { readdirSync } from 'fs';
import { invoke } from 'lodash';
import { resolve, relative, join } from 'path';

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
      const controller = require(resolve(this.dir, this.name)).default;
      if (typeof controller !== 'function') {
        throw new Error('Controller must be a function');
      }

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
    if (ctrl)
      invoke(
        app,
        getVerb(this.name),
        ...[this.getSlug(), ctrl],
      );
  }
}

export default (root) => {
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
