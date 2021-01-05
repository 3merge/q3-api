const getFields = require('./getFields');
const {
  clean,
  chunk,
  castToDoubleQuotes,
  hasLengthGreaterThan,
  reduceIndex,
  reduceSearchableFields,
} = require('./helpers');
const { MIN_GRAM_SIZE } = require('./constants');

module.exports = {
  getSearch: (term) => {
    if (!term || term.length < MIN_GRAM_SIZE) return {};

    const $search = String(term)
      .split(' ')
      .map(clean)
      // remove trailing key terms
      .filter((item) => item.length >= MIN_GRAM_SIZE)
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
      await this.set(
        reduceSearchableFields(
          getFields(this.schema),
          this,
        ),
      );
  },

  async init() {
    const fields = getFields(this.schema);
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

    const cursor = this.find()
      .select(fields.join(' '))
      .cursor();

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
};
