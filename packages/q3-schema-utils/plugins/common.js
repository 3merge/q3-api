/* eslint-disable func-names, no-param-reassign */
const { invoke, get } = require('lodash');
const { exception } = require('q3-core-responder');

const getPathsRecursively = ([key, v]) => {
  if (v.schema)
    return Object.entries(v.schema.paths)
      .map(getPathsRecursively)
      .map((i) => `${key}.${i}`);
  return key;
};

const plugin = (schema) => {
  schema.statics.archive = async function(id) {
    const doc = await this.findById(id).exec();
    if (!doc) return null;

    return doc.updateOne({
      active: false,
    });
  };

  schema.statics.archiveMany = async function(ids) {
    const docs = await this.find({
      _id: { $in: ids },
    }).exec();
    if (!docs || !docs.length) return [];
    return Promise.all(
      docs.map((d) => {
        d.active = false;
        return d.save();
      }),
    );
  };

  schema.statics.findStrictly = async function(id) {
    const doc = await this.findOne({
      _id: id,
      active: true,
    }).exec();

    if (!doc)
      exception('ResourceNotFound')
        .msg('missing')
        .throw();

    return doc;
  };

  schema.methods.getSubDocument = function(field, id) {
    const subdoc = invoke(get(this, field), 'id', id);
    if (!subdoc)
      exception('ResourceMissing')
        .msg('subdocumentNotFound')
        .throw();

    return subdoc;
  };

  schema.methods.pushSubDocument = async function(
    field,
    args,
  ) {
    if (Array.isArray(this[field])) {
      this[field].push(args);
    } else {
      this[field] = [args];
    }

    return this.save();
  };

  schema.methods.removeSubDocument = async function(
    field,
    id,
  ) {
    const removeChild = (v) => {
      const subdoc = this.getSubDocument(field, v);
      subdoc.remove();
    };

    if (Array.isArray(id)) {
      id.map(removeChild);
    } else {
      removeChild(id);
    }

    return this.save();
  };

  schema.methods.updateSubDocument = async function(
    field,
    id,
    args,
  ) {
    const subdoc = await this.getSubDocument(field, id);
    subdoc.set(args);
    return this.save();
  };

  schema.statics.getAllFields = function() {
    return Object.entries(this.schema.paths)
      .map(getPathsRecursively)
      .flat()
      .filter(
        (name) =>
          !name.includes('_id') &&
          !name.includes('__v') &&
          !name.includes('active'),
      );
  };

  schema.statics.getReferentialPaths = function() {
    const arr = [];
    this.schema.eachPath((pathname, schematype) => {
      if (
        schematype.constructor.name === 'ObjectId' &&
        pathname !== '_id' &&
        pathname !== 'createdBy'
      )
        arr.push(pathname);
    });

    return arr;
  };

  schema.statics.getRequiredFields = function() {
    return Object.entries(this.schema.paths)
      .filter(([, value]) => {
        return value.isRequired;
      })
      .map(([key]) => {
        return key;
      });
  };

  schema.statics.findOneOrCreate = async function(
    args,
    options,
  ) {
    const Self = this;
    const doc = await Self.findOne(args)
      .setOptions(options)
      .exec();

    return doc || Self.create(args);
  };

  schema.statics.verifyOutput = function(d) {
    if (!d)
      exception('ResourceMissing')
        .msg('notFound')
        .throw();

    return d;
  };

  schema.add({
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  });

  schema.set('timestamps', true);

  schema.set('toObject', {
    virtuals: true,
    getters: true,
  });

  schema.set('toJSON', {
    virtuals: true,
    getters: true,
  });

  return schema;
};

module.exports = plugin;
