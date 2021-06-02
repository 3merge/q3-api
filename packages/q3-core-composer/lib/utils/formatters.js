/* eslint-disable no-nested-ternary */
const {
  compact,
  get,
  isFunction,
  isObject,
  isString,
  pick,
  size,
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

const pickByTargetObject = (a, b, options = {}) => {
  const getIn = (xs) =>
    options.select ? get(xs, options.select, xs) : xs;

  const pickFrom = (xs) =>
    isObject(b) ? pick(xs, Object.keys(b)) : xs;

  const out =
    isObject(a) && !Array.isArray(a)
      ? getIn(pickFrom(a))
      : a;

  return options.clean ? clean(out) : out;
};

const removeReservedKeys = (xs) =>
  isObject(xs)
    ? [
        'updatedAt',
        'createdAt',
        'createdBy',
        'lastModifiedBy',
      ].forEach((item) => {
        // eslint-disable-next-line
        if (item in xs) delete xs[item];
      })
    : undefined;

const toJSON = (xs) =>
  isObject(xs)
    ? isFunction(get(xs, 'toJSON'))
      ? xs.toJSON()
      : xs
    : {};

module.exports = {
  clean,
  hasLength,
  mapAsync,
  moveWithinPropertyName,
  pickByTargetObject,
  removeReservedKeys,
  toJSON,
};
