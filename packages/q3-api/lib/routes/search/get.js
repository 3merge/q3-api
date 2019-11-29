const { compose, query } = require('q3-core-composer');
const aqp = require('api-query-params');
const mongoose = require('../../config/mongoose');

const SearchParams = async (
  { query: { coll, fields, ...rest } },
  res,
) => {
  try {
    const model = mongoose.model(coll);

    const {
      filter: { search, ...where },
    } = aqp(rest);

    const params = Object.assign(
      model.searchBuilder(search),
      where,
      { active: true },
    );

    const values = await Promise.all(
      fields.map((field) =>
        model.distinct(field, params).exec(),
      ),
    );

    /**
     * @TODO
     * Filter by search term
     * Products pre-find as an example
     */

    res.ok({
      coll,
      total: await model
        .estimatedDocumentCount(params)
        .exec(),

      fields: fields.reduce((a, c, i) => {
        const val = values[i];
        return val
          ? Object.assign(a, {
              [c]: val.filter(Boolean),
            })
          : a;
      }, {}),
    });
  } catch (e) {
    res.status(404).send();
  }
};

// auth needed...

SearchParams.validation = [
  query('coll').isString(),
  query('fields').isArray(),
];

module.exports = compose(SearchParams);
