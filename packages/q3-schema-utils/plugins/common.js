/* eslint-disable func-names, no-param-reassign */
const { invoke, get } = require('lodash');
const { exception } = require('q3-core-responder');
const { executeOn } = require('..');

const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object')
      removeEmpty(obj[key]);
    else if (obj[key] === undefined) delete obj[key];
  });
  return obj;
};

const getPathsRecursively = ([key, v]) => {
  if (v.schema)
    return Object.entries(v.schema.paths)
      .map(getPathsRecursively)
      .map((i) => `${key}.${i}`);
  return key;
};

async function archive(id) {
  const doc = await this.findById(id)
    .setOptions({ redact: true, op: 'Delete' })
    .exec();
  if (!doc) return null;

  doc.set({ active: false });
  return doc.save();
}

async function archiveMany(ids) {
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
}

async function findStrictly(id, options = {}) {
  const doc = await this.findOne({
    _id: id,
    active: true,
  })
    .setOptions({
      redact: true,
      ...options,
    })
    .exec();

  if (!doc)
    exception('ResourceNotFound').msg('missing').throw();

  return doc;
}

function getSubDocument(field, id) {
  const subdoc = invoke(get(this, field), 'id', id);
  if (!subdoc)
    exception('ResourceNotFound')
      .msg('subdocumentNotFound')
      .throw();

  return subdoc;
}

async function pushSubDocument(field, args) {
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
}

async function removeSubDocument(field, id) {
  const removeChild = (v) => {
    const subdoc = this.getSubDocument(field, v);
    subdoc.remove();
  };

  executeOn(id, removeChild);

  return this.save({
    redact: true,
    op: 'Delete',
  });
}

async function updateSubDocuments(field, ids, args) {
  ids.map((id) => {
    const d = invoke(get(this, field), 'id', id);
    return d ? d.set(args) : null;
  });

  return this.save();
}

async function updateSubDocument(field, id, args) {
  const subdoc = await this.getSubDocument(field, id);
  subdoc.set(removeEmpty(args));
  const e = subdoc.validateSync();
  if (e) throw e;

  return this.save({
    redact: true,
    op: 'Update',
  });
}

function getAllFields() {
  return Object.entries(this.schema.paths)
    .map(getPathsRecursively)
    .flat()
    .filter(
      (name) =>
        !name.includes('_id') &&
        !name.includes('__v') &&
        !name.includes('active'),
    );
}

function getReferentialPaths() {
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
}

function getRequiredFields() {
  return Object.entries(this.schema.paths)
    .filter(([, value]) => {
      return value.isRequired;
    })
    .map(([key]) => {
      return key;
    });
}

async function findOneOrCreate(args, options) {
  const doc = await this.findOne(args)
    .setOptions(options)
    .exec();

  return doc || this.create(args);
}

function verifyOutput(d) {
  if (!d)
    exception('ResourceNotFound').msg('notFound').throw();

  return d;
}

const plugin = (schema) => {
  schema.statics.archive = archive;
  schema.statics.archiveMany = archiveMany;
  schema.statics.findStrictly = findStrictly;
  schema.methods.getSubDocument = getSubDocument;
  schema.methods.pushSubDocument = pushSubDocument;
  schema.methods.removeSubDocument = removeSubDocument;
  schema.methods.updateSubDocument = updateSubDocument;
  schema.methods.updateSubDocuments = updateSubDocuments;
  schema.statics.getAllFields = getAllFields;
  schema.statics.getReferentialPaths = getReferentialPaths;
  schema.statics.getRequiredFields = getRequiredFields;
  schema.statics.findOneOrCreate = findOneOrCreate;
  schema.statics.verifyOutput = verifyOutput;

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
