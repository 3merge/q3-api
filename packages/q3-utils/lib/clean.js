const { isObject } = require('lodash');

const clean = (xs) => {
  if (Array.isArray(xs)) return xs.map(clean);
  if (!isObject(xs) || xs instanceof Date) return xs;

  return Object.entries(xs).reduce((acc, [key, v]) => {
    if (v !== undefined)
      Object.assign(acc, {
        [key]: clean(v),
      });

    return acc;
  }, {});
};

// const removeEmpty = (obj) => {
//   Object.keys(obj).forEach((key) => {
//     if (obj[key] && typeof obj[key] === 'object')
//       removeEmpty(obj[key]);
//     else if (obj[key] === undefined) delete obj[key];
//   });
//   return obj;
// };

module.exports = clean;
