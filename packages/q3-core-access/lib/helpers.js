const Comparison = require('comparisons');
const {
  compact,
  get,
  isFunction,
  isObject,
  size,
  mergeWith,
} = require('lodash');

const invokeJSON = (v) =>
  v && 'toJSON' in v ? v.toJSON() : v;

const runComparisonEvaluation = (test = [], value) =>
  test.length
    ? value && new Comparison(test).eval(invokeJSON(value))
    : true;

const filterBy =
  (propertyName, propertyValue) => (grants) =>
    grants.filter((grant) => {
      if (!grant[propertyName]) return false;

      try {
        return grant[propertyName].test(propertyValue);
      } catch (e) {
        return (
          String(grant[propertyName]).toLowerCase() ===
          String(propertyValue).toLowerCase()
        );
      }
    });

exports.hasOptions = (d) =>
  'options' in d ? d.options.redact : d.redact;

exports.hasKeys = (xs) =>
  isObject(xs) && size(Object.keys(xs));

exports.hasFields = ({ fields }) =>
  fields && !fields.includes('!*');

exports.extractUser = (ctx) => {
  try {
    const copy = { ...invokeJSON(ctx.__$q3.USER) };
    return copy;
  } catch (e) {
    return null;
  }
};

const getPluralizedCollectionName = (n) =>
  new RegExp(
    `^${
      n.charAt(n.length - 1) === 's'
        ? n.substring(0, n.length - 1)
        : n
    }+(s?)$`,
    'i',
  );

exports.meetsUserRequirements = (
  { ownershipConditions = [] },
  userInput,
) =>
  runComparisonEvaluation(ownershipConditions, userInput);

exports.meetsDocumentRequirements = (
  { documentConditions = [] },
  doc,
) => runComparisonEvaluation(documentConditions, doc);

exports.filterByColl = (a, value) =>
  filterBy(
    'coll',
    value,
  )(
    a.map((v) => ({
      ...v,
      coll: getPluralizedCollectionName(v.coll),
    })),
  );

exports.filterByOp = (a, value) => filterBy('op', value)(a);

exports.filterByRoleType = (a, value) =>
  filterBy('role', value)(a);

exports.makeArray = (xs) =>
  compact(Array.isArray(xs) ? xs : [xs]);

exports.concat = (xs) => xs.join('.');

/// ////////////////// WILL CHECK AFTER

const clean = (xs) => {
  if (Array.isArray(xs)) return xs.map(clean);
  if (!isObject(xs) || xs instanceof Date) return xs;

  return Object.entries(xs).reduce((acc, [key, v]) => {
    if (v !== undefined) {
      const out = clean(v);

      if (
        out !== null &&
        !(out instanceof Date) &&
        !Array.isArray(out) &&
        typeof out === 'object' &&
        !Object.keys(out).length
      )
        return acc;

      Object.assign(acc, {
        [key]: out,
      });
    }

    return acc;
  }, {});
};

const hasLength = (xs) =>
  isObject(xs) && size(Object.keys(xs));

const toJSON = (xs) =>
  // eslint-disable-next-line
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

exports.clean = clean;
exports.hasLength = hasLength;
exports.toJSON = toJSON;
exports.merge = merge;
