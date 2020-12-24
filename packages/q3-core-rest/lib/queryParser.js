const aqp = require('api-query-params');
const read = require('url');
const { castObjectIds } = require('./utils');
const casters = require('./controllers/casters');

const execSearchBuildMethod = (a, b, search) => {
  let out;

  if (a) out = a.getFuzzyQuery(search);
  else if (b) out = b.getFuzzyQuery(search);
  return search ? out : {};
};

module.exports = (req, Model) => {
  const { originalUrl, datasource } = req;
  const { query: q } = read.parse(originalUrl, true);

  const {
    sort,
    limit = 25,
    projection: select,
    filter: { search, page, ...where },
  } = aqp(q !== null ? q : {}, {
    casters,
  });

  return {
    query: Object.assign(
      execSearchBuildMethod(Model, datasource, search),
      castObjectIds(where),
      {
        active: true,
      },
    ),
    select,
    limit,
    sort,
    page,
  };
};
