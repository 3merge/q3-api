const mongoose = require('mongoose');

// CONSTANTS ...

exports.connect = mongoose.connect;

exports.Factory = class MongooseModelFactory {
  constructor(schemaDef) {
    this.__$schema = new mongoose.Schema(schemaDef);

    Object.entries({
      before: 'post-validate',
      during: 'pre-save',
      after: 'post-save',
    }).forEach(([k, v]) => {
      this[k] = (fn) => {
        this.__$mware(v, fn);
        return this;
      };
    });
  }

  static load(args) {
    return new MongooseModelFactory(args);
  }

  __$mware(hook, fn) {
    const [method, event] = hook.split('-');
    this.__$schema[method](event, async function aa(
      doc,
      next,
    ) {
      // eslint-disable-next-line
      if (!next && typeof doc === 'function') next = doc;

      try {
        await fn(this);
      } catch (e) {
        next(e);
      }
    });
  }

  process(fn) {
    const modifyFindResponse = async (d) => {
      const simplify = (v) => {
        if (
          'toObject' in v &&
          typeof v.toObject === 'function'
        )
          v.toObject();
        return fn(v);
      };

      if (Array.isArray(d))
        return Promise.all(d.map(simplify));

      return simplify(d);
    };

    this.__$schema.post('find', modifyFindResponse);
    this.__$schema.post('findOne', modifyFindResponse);
    this.__$schema.post('findById', modifyFindResponse);
    return this;
  }

  query() {}

  extend() {}

  build(name) {
    return mongoose.model(name, this.__$schema);
  }
};
