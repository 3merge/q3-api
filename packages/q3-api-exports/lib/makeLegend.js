const { sortBy } = require('lodash');
const Q3 = require('q3-api');

module.exports = (columns) =>
  sortBy(columns, 'sort').reduce((acc, curr) => {
    acc[curr.field] = Q3.utils.translate.labels(
      curr.label || curr.field,
    );

    return acc;
  }, {});
