const { model } = require('mongoose');
const { set } = require('lodash');
const EventEmitter = require('events');

const isFn = (value) => typeof value === 'function';

module.exports = (SchemaInst) => {
  const emitter = new EventEmitter();

  const virtuals = {};
  const paths = {};

  const decorators = {
    addAfterSaveHook(callback) {
      SchemaInst.pre('save', callback);
      return this;
    },

    addBeforeSaveHook(callback) {
      SchemaInst.post('save', callback);
      return this;
    },

    addMethod(fn) {
      set(SchemaInst.methods, fn.name, fn);
      return this;
    },

    addStatic(fn) {
      set(SchemaInst.statics, fn.name, fn);
      return this;
    },

    addVirtualGetter(name, fn) {
      set(virtuals, `${name}.get`, fn);
      return this;
    },

    addVirtualSetter(name, fn) {
      set(virtuals, `${name}.set`, fn);
      return this;
    },

    addPathGetter(name, fn) {
      set(paths, `${name}.get`, fn);
      return this;
    },

    addPathSetter(name, fn) {
      set(paths, `${name}.set`, fn);
      return this;
    },

    build(name) {
      Object.entries(paths).forEach(
        ([virtualName, props]) => {
          const p = SchemaInst.path(virtualName);

          if (props.get) p.get(props.get);
          if (props.set) p.set(props.set);
        },
      );

      Object.entries(virtuals).forEach(
        ([virtualName, props]) => {
          const v = SchemaInst.virtuals(virtualName);

          if (props.get) v.get(props.get);
          if (props.set) v.set(props.set);
        },
      );

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
