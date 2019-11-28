const aqp = require('api-query-params');
const read = require('url');
const {
  getColumnsHeadersFromPayload,
  populateEmptyObjectKeys,
  transformArraysInDotNotation,
} = require('../../utils');

module.exports = async (req, res) => {
  const {
    url,
    t,
    marshal,
    collectionPluralName,
    datasource,
  } = req;

  const { query: q } = read.parse(url);

  const {
    sort,
    limit = 50,
    projection: select,
    filter: { search, page, ...where },
  } = aqp(q !== null ? q : {});

  const params = Object.assign(
    datasource.searchBuilder(search),
    where,
    { active: true },
  );

  const {
    docs,
    totalDocs,
    hasNextPage,
    hasPrevPage,
  } = await datasource.paginate(params, {
    page: page >= 0 ? page + 1 : 1,
    sort,
    select,
    limit,
  });

  const payload = marshal(docs);

  if (req.get('Accept') === 'text/csv') {
    const columns = getColumnsHeadersFromPayload(payload);
    const rows = populateEmptyObjectKeys(payload, columns);

    res.csv(
      transformArraysInDotNotation(rows, (v) =>
        t(`labels:${v}`),
      ),
      true,
    );
  } else {
    res.ok({
      [collectionPluralName]: payload,
      total: totalDocs,
      hasNextPage,
      hasPrevPage,
    });
  }
};
