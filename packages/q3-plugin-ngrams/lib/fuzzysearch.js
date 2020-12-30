const {
  chunk,
  castToDoubleQuotes,
  getRange,
  hasLengthGreaterThan,
  mapWord,
  reduceIndex,
  reduceSearchableFields,
} = require('./helpers');

const everyEquals = (a = [], v) =>
  a.every((item) => item === v);

module.exports = (fields = []) => ({
  getSearch: (term) => {
    const range = getRange(fields, term);
    if (everyEquals(range, 1)) return {};

    const [, max] = range;
    const $search = mapWord(term, (word) => {
      const c = chunk(word, max);

      return hasLengthGreaterThan(c, 1)
        ? c.map(castToDoubleQuotes(max))
        : c;
    });

    return {
      $text: {
        $search,
      },
    };
  },

  async saveGrams() {
    await this.update({
      $set: reduceSearchableFields(fields, this),
    });
  },

  async init() {
    await this.collection.createIndex(reduceIndex(fields), {
      name: 'ngrams',
      sparse: true,
    });

    return new Promise((resolve, reject) =>
      this.find()
        .stream()
        .on('data', async (doc) =>
          this.updateOne(
            { _id: doc._id },
            { $set: reduceSearchableFields(fields, doc) },
          ),
        )
        .on('error', (e) => {
          reject(e);
        })
        .on('end', (res) => {
          resolve(res);
        }),
    );
  },
});
