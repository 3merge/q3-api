const aws = require('q3-adapter-aws');
const { get } = require('lodash');

const strategies = { aws };

module.exports = class FileAdapaterLoader {
  static of() {
    const instance = new this();
    instance.strategies = strategies;
    return instance;
  }

  init(strategy) {
    this.strategy = strategy;
  }

  get instance() {
    return get(strategies, this.strategy, aws);
  }
};
