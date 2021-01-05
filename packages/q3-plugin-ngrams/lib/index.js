const { init, getSearch, saveGrams } = require('./plugin');

const NGramsMongoosePlugin = (s) => {
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
