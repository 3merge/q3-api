const mongoose = require('mongoose');

const isTruthy = (val) => val === 'true';
const unwrap = (v) => String(v).replace(/^"(.*)"$/, '$1');

const enforceAnchor = (v) => {
  if (String(v).charAt(0) !== '^') return `^${v}`;
  return v;
};

const toString = (v) => {
  const str = String(v);
  const parts = str.match(/^\/(.*)\/([igm]*)$/);

  return !String(v).startsWith('/') || !parts
    ? unwrap(str)
    : new RegExp(enforceAnchor(parts[1]), parts[2] || 'i');
};

module.exports = {
  exists: (val) =>
    isTruthy(val) ? Boolean(val) : { $ne: true },
  has: (val) =>
    isTruthy(val)
      ? {
          $exists: true,
          $nin: [null, '', []],
        }
      : null,
  in: (val) =>
    String(val)
      .match(/(".*?"|[^",]+)/g)
      .map(toString),
  string: toString,
  id: (xs) =>
    mongoose.isValidObjectId(xs)
      ? {
          $in: [mongoose.Types.ObjectId(xs), xs],
        }
      : xs,
};
