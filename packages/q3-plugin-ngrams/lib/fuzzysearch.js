const {
  clean,
  chunk,
  castToDoubleQuotes,
  hasLengthGreaterThan,
  reduceIndex,
  reduceSearchableFields,
} = require('./helpers');

module.exports = (fields = []) => ({
  getSearch: (term) => {
    if (!term || term.length < 2) return {};

    const $search = String(term)
      .split(' ')
      .map(clean)
      .map(chunk)
      .flat(2)
      .map(castToDoubleQuotes)
      .join(' ');

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
    const index = reduceIndex(fields);

    if (!hasLengthGreaterThan(Object.keys(index), 0))
      throw new Error(
        'At least one schema property requires a "gram" value greater than 1',
      );

    await this.collection.createIndex(index, {
      name: 'ngrams',
      sparse: true,
      default_language: 'none',
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
