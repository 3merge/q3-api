/* eslint-disable func-names, no-param-reassign */
const { exception } = require('q3-core-responder');

const acOptionsForDeleteQueries = {
  redact: true,
  op: 'Delete',
};

const getPathsRecursively = ([key, v]) => {
  if (v.schema)
    return Object.entries(v.schema.paths)
      .map(getPathsRecursively)
      .map((i) => `${key}.${i}`);
  return key;
};

const primeForDeletion = async (doc, args = {}) => {
  if (typeof doc.onArchive === 'function') {
    await doc.onArchive();
  } else {
    doc.set({
      active: false,
    });
  }

  return doc.save(args);
};

async function archive(id) {
  const doc = await this.findById(id)
    .setOptions(acOptionsForDeleteQueries)
    .exec();

  return doc
    ? primeForDeletion(doc, acOptionsForDeleteQueries)
    : null;
}

async function archiveMany(ids) {
  const docs = await this.find({
    _id: { $in: ids },
  })
    .setOptions(acOptionsForDeleteQueries)
    .exec();

  if (!docs || !docs.length) return [];
  return Promise.all(
    docs.map((d) =>
      primeForDeletion(d, acOptionsForDeleteQueries),
    ),
  );
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
    .filter(([, value]) => value.isRequired)
    .map(([key]) => key);
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
  schema.statics.getAllFields = getAllFields;
  schema.statics.getReferentialPaths = getReferentialPaths;
  schema.statics.getRequiredFields = getRequiredFields;
  schema.statics.findOneOrCreate = findOneOrCreate;
  schema.statics.verifyOutput = verifyOutput;

  schema.set('timestamps', true);

  schema.set('toObject', {
    virtuals: true,
    getters: true,
  });

  schema.set('toJSON', {
    virtuals: true,
    getters: true,
  });

  if (schema.options.enableArchive) {
    schema.statics.archive = archive;
    schema.statics.archiveMany = archiveMany;

    schema.add({
      active: {
        type: Boolean,
        default: true,
      },
    });
  }

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
