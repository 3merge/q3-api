const fuzzysearch = require('./fuzzysearch');
const {
  getFieldName,
  getGramOptions,
} = require('./helpers');

const NGramsMongoosePlugin = (s) => {
  const fields = [];

  const iterateSchema = (schema, prevpath = '') =>
    schema.eachPath((path, obj) => {
      const join = [prevpath, path]
        .filter((i = '') => i.trim())
        .join('.');

      if (obj.options.searchable)
        fields.push(getGramOptions(join, obj.options));

      if (obj.schema) iterateSchema(obj.schema, join);
    });

  iterateSchema(s);

  if (s.discriminators)
    Object.values(s.discriminators).forEach((v) =>
      iterateSchema(v),
    );

  const { init, getSearch, saveGrams } = fuzzysearch(
    fields,
  );

  // eslint-disable-next-line
  s.statics.getFuzzyQuery = getSearch;
  // eslint-disable-next-line
  s.statics.initializeFuzzySearching = init;
  s.pre('save', saveGrams);

  s.add(
    fields.reduce((acc, curr) => {
      acc[`${getFieldName(curr)}_ngram`] = {
        type: [String],
        select: false,
      };

      return acc;
    }, {}),
  );

  return s;
};

module.exports = NGramsMongoosePlugin;
