const { size } = require('lodash');
const getFields = require('./getFields');
const {
  clean,
  chunk,
  castToDoubleQuotes,
  hasLengthGreaterThan,
  reduceIndex,
  reduceSearchableFields,
} = require('./helpers');

module.exports = {
  getSearch: (term) => {
    if (!term) return {};

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

  saveGrams() {
    try {
      const fields = getFields(this.schema);

      const isParent =
        typeof this.parent !== 'function' ||
        this.parent() === undefined;

      if (
        isParent &&
        fields.some((item) => this.isModified(item))
      )
        this.set(reduceSearchableFields(fields, this));
    } catch (e) {
      // noop
    }
  },

  async index() {
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
  },

  async init(query = {}) {
    const fields = getFields(this.schema);

    const cursor = await this.find(query)
      .select(fields.join(' '))
      .lean()
      .exec();

    // avoid bulk op without results
    if (!size(cursor)) return null;

    const bulkOp = this.collection.initializeUnorderedBulkOp();

    cursor.forEach((doc) =>
      bulkOp.find({ _id: doc._id }).updateOne({
        $set: reduceSearchableFields(fields, doc),
      }),
    );

    return bulkOp.execute();
  },
};
