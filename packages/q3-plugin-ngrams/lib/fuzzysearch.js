const {
  getRange,
  makeGram,
  reduceIndex,
  reduceSearchableFields,
} = require('./helpers');

module.exports = (fields = []) => ({
  getSearch: (term) => {
    console.log(
      getRange(fields, term),
      makeGram(term, ...getRange(fields, term)),
    );
    return {
      $text: {
        $search: makeGram(
          term,
          ...getRange(fields, term),
        ).join(' '),
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
