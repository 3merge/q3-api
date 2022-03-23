const aqp = require('api-query-params');
const read = require('url');
const { get } = require('lodash');
const { castObjectIds } = require('./utils');
const casters = require('./controllers/casters');

const execSearchBuildMethod = (a, b, search) => {
  let out;

  const callOnParam = (param) => {
    out = param.getFuzzyQuery(search);
  };

  if (a) callOnParam(a);
  else if (b) callOnParam(b);
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
      execSearchBuildMethod(
        Model,
        datasource,
        // rely on uncasted search when available
        get(q, 'search', search),
      ),
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
