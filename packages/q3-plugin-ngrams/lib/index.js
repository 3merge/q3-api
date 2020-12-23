const fuzzysearch = require('./fuzzysearch');
const save = require('./save');
const setup = require('./setup');

const NGramsMongoosePlugin = (s) => {
  const fields = [];

  const iterateSchema = (schema, prevpath = '') =>
    schema.eachPath((path, obj) => {
      const join = [prevpath, path]
        .filter((i = '') => i.trim())
        .join('.');

      if (obj.options.searchable) fields.push(join);
      if (obj.schema) iterateSchema(obj.schema, join);
    });

  iterateSchema(s);

  if (s.discriminators)
    Object.values(s.discriminators).forEach((v) =>
      iterateSchema(v),
    );

  // eslint-disable-next-line
  s.statics.fuzzy = fuzzysearch;
  // eslint-disable-next-line
  s.statics.setup = setup(fields);
  s.pre('save', save(fields));
  return s;
};

module.exports = NGramsMongoosePlugin;
