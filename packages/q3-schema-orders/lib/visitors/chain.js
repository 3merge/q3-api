const { invoke } = require('lodash');
const { untilDone } = require('../utils/helpers');

module.exports = class SchemaVisitorChain {
  constructor(executionOrder = []) {
    this.executionOrder = executionOrder;
    this.store = {};
    this.options = {};
  }

  async run(values = {}, actions = {}, options = {}) {
    this.store = values;
    this.options = options;
    await untilDone(await this.$chain(actions));
    return this.store;
  }

  async *$chain(actions = {}) {
    for (
      let i = 0;
      i < this.executionOrder.length;
      i += 1
    ) {
      const item = this.executionOrder[i];
      yield invoke(this, item, actions);
    }
  }

  async checkEmbeddedArray(fn, key) {
    this.store[key] = fn ? await fn(this.store) : [];
  }
};
