const Aws = require('q3-adapter-aws');
const { isFunction, get } = require('lodash');

module.exports = class FileAdapaterLoader {
  static of() {
    return new this();
  }

  constructor() {
    this.strategy = process.env.FILE_STRATEGY;
  }

  get adapter() {
    const fn = get({ Aws }, this.strategy);
    return isFunction(fn) ? fn() : Aws();
  }
};
