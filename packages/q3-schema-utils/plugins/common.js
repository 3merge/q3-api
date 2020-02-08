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

    return doc.updateOne(
      {
        active: false,
      },
      {
        redact: true,
        op: 'Delete',
      },
    );
  };

  schema.statics.archiveMany = async function(ids) {
    const docs = await this.find({
      _id: { $in: ids },
    }).exec();
    if (!docs || !docs.length) return [];
    return Promise.all(
      docs.map((d) => {
        d.active = false;
        return d.save({
          redact: true,
          op: 'Delete',
        });
      }),
    );
  };

  schema.statics.findStrictly = async function(id) {
    const doc = await this.findOne({
      _id: id,
      active: true,
    })
      .setOptions({ redact: true })
      .exec();

    if (!doc)
      exception('ResourceNotFound')
        .msg('missing')
        .throw();

    return doc;
  };

  schema.methods.getSubDocument = function(field, id) {
    const subdoc = invoke(get(this, field), 'id', id);
    if (!subdoc)
      exception('ResourceNotFound')
        .msg('subdocumentNotFound')
        .throw();

    return subdoc;
  };

  schema.methods.pushSubDocument = async function(
    field,
    args,
  ) {
    let preValidationResult;
    if (Array.isArray(this[field])) {
      this[field].push(args);
    } else {
      this[field] = [args];
    }

    try {
      preValidationResult = this[field][
        this[field].length - 1
      ].validateSync();
    } catch (e) {
      // noop
    }

    if (preValidationResult) throw preValidationResult;

    return this.save({
      redact: true,
    });
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

    return this.save({
      redact: true,
      op: 'Delete',
    });
  };

  schema.methods.updateSubDocument = async function(
    field,
    id,
    args,
  ) {
    const subdoc = await this.getSubDocument(field, id);
    subdoc.set(args);
    const e = subdoc.validateSync();
    if (e) throw e;

    return this.save({
      redact: true,
      op: 'Update',
    });
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
    const doc = await this.findOne(args)
      .setOptions(options)
      .exec();

    return doc || this.create(args);
  };

  schema.statics.verifyOutput = function(d) {
    if (!d)
      exception('ResourceNotFound')
        .msg('notFound')
        .throw();

    return d;
  };

  schema.add({
    active: {
      type: Boolean,
      default: true,
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

  if (schema.options.featured)
    schema.add({
      featured: {
        type: Boolean,
        default: false,
      },
    });

  return schema;
};

module.exports = plugin;
