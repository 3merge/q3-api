const { model } = require('mongoose');
const { invoke, set } = require('lodash');
const EventEmitter = require('events');

const isFn = (value) => typeof value === 'function';

const makeAddFunction = (SchemaInst) => ({
  gen: (prop) =>
    // requires function declaration to maintain context
    // eslint-disable-next-line
    function (fn) {
      set(SchemaInst, `${prop}.${fn.name}`, fn);
      return this;
    },
});

const makeStorageFunction = (SchemaInst, methodName) => {
  const out = {};

  const append = () =>
    Object.entries(out).forEach(([name, props]) => {
      const p = invoke(SchemaInst, methodName, name);
      if (props.get) p.get(props.get);
      if (props.set) p.set(props.set);
    });

  const gen = (op) =>
    // eslint-disable-next-line
    function (name, fn) {
      set(out, `${name}.${op}`, fn);
      return this;
    };

  return {
    out,
    append,
    gen,
  };
};

module.exports = (SchemaInst) => {
  const emitter = new EventEmitter();

  const fn = makeAddFunction(SchemaInst);
  const paths = makeStorageFunction(SchemaInst, 'path');
  const virtuals = makeStorageFunction(
    SchemaInst,
    'virtual',
  );

  const decorators = {
    addAfterSaveHook(callback) {
      SchemaInst.pre('save', callback);
      return this;
    },

    addBeforeSaveHook(callback) {
      SchemaInst.post('save', callback);
      return this;
    },

    // these need to be exposed...
    addMethod: fn.gen('methods'),
    addStatic: fn.gen('statics'),

    addPathGetter: paths.gen('get'),
    addPathSetter: paths.gen('set'),

    addVirtualGetter: virtuals.gen('get'),
    addVirtualSetter: virtuals.gen('set'),

    extend: (args, options) =>
      isFn(args)
        ? SchemaInst.plugin(args, options)
        : SchemaInst.add(args),

    listen(eventName, callback) {
      emitter.on(eventName, callback);
      return this;
    },

    build(name) {
      paths.append();
      virtuals.append();
      return model(name, SchemaInst);
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
