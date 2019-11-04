/* eslint-disable func-names, no-param-reassign */
const { Schema } = require('mongoose');
const { invoke, get } = require('lodash');
const { exception } = require('q3-core-responder');
const Notes = require('../models/note');
const Files = require('../models/files');

const getPathsRecursively = ([key, v]) => {
  if (v.schema)
    return Object.entries(v.schema.paths)
      .map(getPathsRecursively)
      .map((i) => `${key}.${i}`);
  return key;
};

const plugin = (schema) => {
  if (!schema.options.disableArchive)
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

    return doc.updateOne({
      active: false,
    });
  };

  schema.statics.searchBuilder = function(term) {
    if (!term) return {};

    const arr = [];
    const statement = String(term || '')
      .split(' ')
      .map((phrase) => `(?=.*${phrase})`)
      .join('|');

    const iterateSchema = (s, prevpath) =>
      s.eachPath((path, obj) => {
        const join = [prevpath, path]
          .filter((i = '') => i.trim())
          .join('.');

        if (obj.options.searchable) arr.push(join);
        if (obj.schema) iterateSchema(obj.schema, join);
      });

    const $regex = new RegExp(`^${statement}.*$`, 'gi');
    iterateSchema(this.schema);

    /*
    iterateSchema(
      Object.values(
        this.schema.discriminators || {},
      ).forEach((d) => iterateSchema(d.schema)),
    ); */

    return arr.length
      ? {
          $or: arr.map((field) => ({
            [field]: { $regex },
          })),
        }
      : {};
  };

  schema.methods.getSubDocument = async function(
    field,
    id,
  ) {
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
    const subdoc = await this.getSubDocument(field, id);
    subdoc.remove();
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

  schema.statics.getAllFields = function() {
    return Object.entries(this.schema.paths)
      .map(getPathsRecursively)
      .flat();
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

  schema.statics.list = async function(params) {
    const {
      limit = 50,
      skip = 0,
      active = true,
      search: searchTerm,
      select,
      ...rest
    } = params;

    // find it in the ensted paths
    const { search = [] } = this.schema.options;

    return this.paginate(
      {
        ...rest,
        ...this.searchBuilder(searchTerm, search),
        active,
      },
      {
        limit,
        select,
        skip,
      },
    );
  };

  schema.statics.verifyOutput = function(d) {
    if (!d)
      exception('ResourceMissing')
        .msg('notFound')
        .throw();

    return d;
  };

  // more will happen later
  schema.methods.version = function(a) {
    return this.set(a).save();
  };

  if (schema.options.uploads) {
    schema.add(Notes);
  }

  if (schema.options.uploads) {
    schema.add(Files);
  }

  Object.assign(schema.options, {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

  return schema;
};

module.exports = plugin;
