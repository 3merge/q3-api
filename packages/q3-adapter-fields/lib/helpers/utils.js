const { isObject, isUndefined } = require('lodash');

exports.condense = (xs) =>
  isObject(xs)
    ? Object.entries(xs).reduce((acc, [key, value]) => {
        if (!isUndefined(key)) acc[key] = value;
        return acc;
      }, {})
    : {};
