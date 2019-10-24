/* eslint-disable func-names, no-param-reassign */
const { Schema } = require('mongoose');
const { invoke, get } = require('lodash');
const expection = require('../errors');

const getPathsRecursively = ([key, v]) => {
  if (v.schema)
    return Object.entries(v.schema.paths)
      .map(getPathsRecursively)
      .map((i) => `${key}.${i}`);
  return key;
};

const plugin = (schema) => {
  schema.add(
    new Schema({
      active: {
        type: Boolean,
        default: true,
      },
    }),
  );

  schema.statics.archive = async function(id) {
    const doc = await this.findById(id).exec();
    if (!doc) return null;

    doc.active = false;
    return doc.save();
  };

  schema.statics.searchBuilder = function(
    term,
    fields = [],
  ) {
    if (!term) return {};
    const statement = String(
      Array.isArray(term) ? term.join('|') : term,
    )
      .split(' ')
      .map((phrase) => `(?=.*${phrase})`)
      .join('');
    const $regex = new RegExp(`^${statement}.*$`, 'gi');

    return {
      $or: fields.map((field) => ({
        [field]: { $regex },
      })),
    };
  };

  schema.methods.getSubDocument = async function(
    field,
    id,
  ) {
    const subdoc = invoke(get(this, field), 'id', id);
    if (!subdoc) throw new Error('Noop');
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
    this.getSubDocument(field, id).remove();
    return this.save();
  };

  schema.methods.updateSubDocument = async function(
    field,
    id,
    args,
  ) {
    this.getSubDocument(field, id).set(args);
    return this.save();
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
    const doc = await this.findById(id).exec();
    if (!doc)
      expection('ResourceNotFound')
        .msg('missing')
        .throw();

    return doc;
  };

  schema.statics.getAllFields = function() {
    return Object.entries(this.schema.paths)
      .map(getPathsRecursively)
      .flat();
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

  Object.assign(schema.options, {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });
};

module.exports = plugin;
