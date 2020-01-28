const {
  compose,
  query,
  verify,
} = require('q3-core-composer');
const aqp = require('api-query-params');
const mongoose = require('../../config/mongoose');

const SearchParams = async (
  { query: { collectionName, fields, ...rest } },
  res,
) => {
  try {
    const model = mongoose.model(collectionName);

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

    res.ok({
      collectionName,
      total: await model.countDocuments(params).exec(),
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
    res.status(400).send();
  }
};

SearchParams.validation = [
  query('collectionName').isString(),
  query('fields').isArray(),
];

SearchParams.authorization = [verify];
module.exports = compose(SearchParams);
