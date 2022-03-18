const { map, includes, isObject, get } = require('lodash');
const mongoose = require('mongoose');

const decorateQueuedFunction =
  (fn) =>
  (...args) => {
    const f = args[0];

    if (isObject(f) && Array.isArray(f.batch))
      return Promise.all(
        f.batch.map((item) => {
          const copy = [...args];
          copy[0] = item;
          return fn(...copy);
        }),
      );

    return fn(...args);
  };

const notInclusive =
  (a = []) =>
  (curr) =>
    !includes(a, curr);

// eslint-disable-next-line
const extractId = (xs, options = {}) => {
  if (isObject(xs) && xs._id) {
    const v =
      // due to autopopulation
      isObject(xs._id) && xs._id._id ? xs._id._id : xs._id;

    const output = mongoose.Types.ObjectId.isValid(v)
      ? mongoose.Types.ObjectId(v)
      : undefined;

    if (get(options, 'reassign'))
      Object.assign(xs, {
        _id: output,
      });

    return output;
  }
};

const getId = (xs) => extractId(xs) || null;
const castId = (xs) => {
  extractId(xs, {
    reassign: true,
  });

  return xs;
};

const mapIdToString = (a = []) =>
  map(map(a, '_id'), String);

module.exports = {
  castId,
  decorateQueuedFunction,
  getId,
  mapIdToString,
  notInclusive,
};
