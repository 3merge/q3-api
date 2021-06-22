const { isObject, upperCase } = require('lodash');

exports.capitalizeObjectKeys = (xs) =>
  isObject(xs)
    ? Object.entries(xs).reduce(
        (acc, [key, value]) =>
          Object.assign(acc, {
            [upperCase(key)]: value,
          }),
        {},
      )
    : {};
