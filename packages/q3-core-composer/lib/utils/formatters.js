/* eslint-disable no-nested-ternary */
const {
  compact,
  get,
  isFunction,
  isObject,
  isString,
  size,
  mergeWith,
} = require('lodash');

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

const hasLength = (xs) =>
  isObject(xs) && size(Object.keys(xs));

const mapAsync = (xs, fn) =>
  Promise.all(Array.isArray(xs) ? compact(xs).map(fn) : []);

const moveWithinPropertyName = (prefix, xs) =>
  isString(prefix)
    ? {
        [prefix]: xs,
      }
    : xs;

const toJSON = (xs) =>
  isObject(xs)
    ? isFunction(get(xs, 'toJSON'))
      ? xs.toJSON()
      : xs
    : {};

const merge = (...objs) =>
  mergeWith({}, ...objs, (obj, src) => {
    if (
      Array.isArray(src) &&
      src.every((item) => !isObject(item))
    )
      return src;

    return undefined;
  });

module.exports = {
  clean,
  hasLength,
  mapAsync,
  moveWithinPropertyName,
  toJSON,
  merge,
};
