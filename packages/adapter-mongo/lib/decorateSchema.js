const { model } = require('mongoose');
const { set } = require('lodash');
const EventEmitter = require('events');

const isFn = (value) => typeof value === 'function';

const defaultFn = (value) =>
  isFn(value) ? value : (a) => a;

module.exports = (SchemaInst) => {
  const emitter = new EventEmitter();

  const decorators = {
    addAfterSaveHook(callback) {
      SchemaInst.pre('save', callback);
      return this;
    },

    addBeforeSaveHook(callback) {
      SchemaInst.post('save', callback);
      return this;
    },

    addMethod(name, fn) {
      set(SchemaInst.methods, name, fn);
      return this;
    },

    addStatic(name, fn) {
      set(SchemaInst.statics, name, fn);
      return this;
    },

    addVirtualMethod: (name, getter, setter) =>
      SchemaInst.virtual(name)
        .get(defaultFn(getter))
        .set(defaultFn(setter)),

    build(name) {
      SchemaInst.set('collectionSingularName', name);
      SchemaInst.set('collectionPluralName', name);
      SchemaInst.set('restify', '*');
      return model(name, SchemaInst);
    },

    extend: (args) =>
      isFn(args)
        ? SchemaInst.plugin(args)
        : SchemaInst.add(args),

    listen(eventName, fn) {
      emitter.on(eventName, fn);
      return this;
    },

    out() {
      return SchemaInst;
    },
  };

  decorators.addMethod('dispatch', (eventName, data) =>
    emitter.emit(eventName, data),
  );

  return decorators;
};
