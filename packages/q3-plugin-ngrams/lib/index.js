const fuzzysearch = require('./fuzzysearch');
const {
  filterByLength,
  getFieldName,
  getGramSize,
} = require('./helpers');

const NGramsMongoosePlugin = (s) => {
  const fields = [];

  const recursivelyFindGrams = (schema, prevpath = '') =>
    schema.eachPath((path, obj) => {
      const parts = [prevpath, path];
      const join = filterByLength(parts).join('.');
      const gSize = getGramSize(obj);

      if (gSize)
        fields.push({
          gram: gSize,
          name: join,
        });

      if (obj.schema)
        recursivelyFindGrams(obj.schema, join);
    });

  recursivelyFindGrams(s);

  if (s.discriminators)
    Object.values(s.discriminators).forEach((v) =>
      recursivelyFindGrams(v),
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
