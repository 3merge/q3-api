const { isString, size } = require('lodash');
const getFields = require('./getFields');
const {
  clean,
  chunk,
  hasLengthGreaterThan,
  reduceIndex,
  reduceSearchableFields,
} = require('./helpers');
const { MAX_GRAM_SIZE } = require('./constants');

module.exports = {
  getSearch(term) {
    if (!term) return {};

    if (
      !this ||
      !this.schema ||
      !size(getFields(this.schema))
    )
      return {
        $text: {
          $caseSensitive: false,
          $search: String(term)
            .split(' ')
            .map((item) => `"${item}"`)
            .join(' '),
        },
      };

    const $all = String(term)
      .split(' ')
      .map(clean)
      .map((item) => {
        const out = chunk(item);

        if (isString(item)) {
          const longform = item
            .slice(0, MAX_GRAM_SIZE)
            .trim();

          if (!out.includes(longform)) out.push(longform);
        }
        return out;
      })
      .flat(2);

    return {
      ngrams: {
        $all,
      },
    };
  },

  saveGrams() {
    try {
      const fields = getFields(this.schema);

      const isParent =
        typeof this.parent !== 'function' ||
        this.parent()._id.equals(this._id);

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

    const bulkOp =
      this.collection.initializeUnorderedBulkOp();

    cursor.forEach((doc) =>
      bulkOp.find({ _id: doc._id }).updateOne({
        $set: reduceSearchableFields(fields, doc),
      }),
    );

    return bulkOp.execute();
  },
};
