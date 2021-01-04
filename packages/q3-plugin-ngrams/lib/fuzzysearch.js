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
    const isParent =
      typeof this.parent !== 'function' ||
      this.parent() === undefined;

    if (isParent)
      await this.set(reduceSearchableFields(fields, this));
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

    const cursor = this.find().cursor();

    for (
      let doc = await cursor.next();
      doc != null;
      // eslint-disable-next-line
      doc = await cursor.next()
    )
      // eslint-disable-next-line
      await this.updateOne(
        { _id: doc._id },
        { $set: reduceSearchableFields(fields, doc) },
      );
  },
});
