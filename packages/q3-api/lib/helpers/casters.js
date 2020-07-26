const parse = require('q3-core-rest/lib/queryParser');

exports.toUndefined = (v) =>
  v === '' || v === null ? undefined : v;

exports.toQuery = (req = {}) => {
  const { query } = parse(req);
  delete query.template;
  return query;
};
