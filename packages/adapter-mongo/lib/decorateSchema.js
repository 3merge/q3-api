const { model } = require('mongoose');
const { set } = require('lodash');

const isFn = (value) => typeof value === 'function';

const defaultFn = (value) =>
  isFn(value) ? value : (a) => a;

module.exports = (SchemaInst) => ({
  raw: SchemaInst,

  addAfterHook: (when, callback) =>
    SchemaInst.post(when, callback),

  addBeforeHook: (when, callback) =>
    SchemaInst.pre(when, callback),

  addPrototypeMethod: (name, fn) =>
    set(SchemaInst.methods, name, fn),

  addStaticMethod: (name, fn) =>
    set(SchemaInst.statics, name, fn),

  addVirtualMethod: (name, getter, setter) =>
    SchemaInst.virtual(name)
      .get(defaultFn(getter))
      .set(defaultFn(setter)),

  build: () => {
    SchemaInst.set(
      'collectionSingularName',
      SchemaInst.instanceName,
    );

    SchemaInst.set('collectionPluralName', SchemaInst.name);
    SchemaInst.set('restify', '*');

    model(SchemaInst.name, SchemaInst);
  },

  extend: (args) =>
    isFn(args)
      ? SchemaInst.plugin(args)
      : SchemaInst.add(args),
});
