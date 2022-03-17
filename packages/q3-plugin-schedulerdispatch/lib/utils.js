const {
  map,
  includes,
  isObject,
  isString,
} = require('lodash');
const mongoose = require('mongoose');
const path = require('path');

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

const getId = (xs) => {
  if (isObject(xs) && xs._id) {
    const v =
      // due to autopopulation
      isObject(xs._id) && xs._id._id ? xs._id._id : xs._id;

    return mongoose.Types.ObjectId.isValid(v)
      ? mongoose.Types.ObjectId(v)
      : null;
  }

  return null;
};

const mapIdToString = (a = []) =>
  map(map(a, '_id'), String);

const notInclusive =
  (a = []) =>
  (curr) =>
    !includes(a, curr);

const getWebAppUrlAsTenantUser = (user = {}) => {
  const url = process.env.WEB_APP;
  const { tenant } = user;

  if (tenant) {
    const [protocol, host] = url.split('//');
    return `${protocol}//${tenant}.${host}`;
  }

  return url;
};

const stripFileName = (str) =>
  isString(str) ? path.basename(str).split('.')[0] : str;

const getTargetListener = () => {
  try {
    return new Error('Find caller').stack.split(
      /\n\s*at\s+/g,
    )[3];
  } catch (e) {
    throw new Error('Could not trace listener to filename');
  }
};

const castId = (xs) => {
  if (isObject(xs) && xs._id) {
    const v =
      // due to autopopulation
      isObject(xs._id) && xs._id._id ? xs._id._id : xs._id;

    // eslint-disable-next-line
    xs._id = mongoose.Types.ObjectId.isValid(v)
      ? mongoose.Types.ObjectId(v)
      : undefined;
  }

  return xs;
};

module.exports = {
  castId,
  decorateQueuedFunction,
  getId,
  getTargetListener,
  getWebAppUrlAsTenantUser,
  mapIdToString,
  notInclusive,
  stripFileName,
};
