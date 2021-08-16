/* eslint-disable no-param-reassign  */
const { map, get, isNil } = require('lodash');
const { exception } = require('q3-core-responder');

module.exports =
  (fn) =>
  (...params) => {
    const [req] = params;
    const ids = get(req, 'query.ids');

    if (!Array.isArray(ids) || ids.some(isNil))
      exception('Validation')
        .msg('subDocumentIdsRequired')
        .throw();

    params[0].ids = map(ids, (v) =>
      typeof v === 'string'
        ? v.split(',').map((item) => item.trim())
        : v,
    ).flat();

    delete params[0].body.ids;
    return fn(...params);
  };
