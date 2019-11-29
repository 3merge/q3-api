const { resolve, relative } = require('path');
const { getNestedPath, getVerb } = require('./utils');

module.exports = class DirectoryWalker {
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

    if (process.env.DEBUG)
      // eslint-disable-next-line
      console.log(
        `${verb.toUpperCase()} route registered:`,
        this.getSlug(),
      );
    if (ctrl && verb in app)
      app[verb](this.getSlug(), ctrl);
  }
};
