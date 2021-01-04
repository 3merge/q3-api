const { get } = require('lodash');
const fuzzysearch = require('./fuzzysearch');
const { filterByLength } = require('./helpers');

const NGramsMongoosePlugin = (s) => {
  const fields = [];

  const recursivelyFindGrams = (schema, prevpath = '') =>
    schema.eachPath((path, obj) => {
      const parts = [prevpath, path];
      const join = filterByLength(parts).join('.');

      if (get(obj, 'options.gram', false))
        fields.push(join);

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

  s.add({
    ngrams: {
      type: [String],
      select: false,
    },
  });
};

module.exports = NGramsMongoosePlugin;
