const { invoke } = require('lodash');

class CoreDatasource {
  constructor(AdapterInst) {
    this.__$engine = AdapterInst;
  }

  define(type, callback) {
    return invoke(
      this.__$engine,
      {
        'hook': 'addHookMethod',
        'method': 'addPrototypeMethod',
        'static': 'addStaticMethod',
        'virtual': 'addVirtualMethod',
      }[type],
      callback,
    );
  }

  extend(...params) {
    this.__$engine.extend(...params);
  }
}

module.exports = CoreDatasource;
