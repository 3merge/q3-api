/* eslint-disable no-param-reassign */
const {
  index,
  init,
  getSearch,
  saveGrams,
} = require('./plugin');

const NGramsMongoosePlugin = (s) => {
  s.statics.createTextIndex = index;
  s.statics.getFuzzyQuery = getSearch;
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
