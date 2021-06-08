const { flatten, unflatten } = require('flat');
const Comparison = require('comparisons');
const micromatch = require('micromatch');
const {
  isObject,
  get,
  compact,
  size,
  map,
  uniq,
} = require('lodash');
const Grant = require('./grant');

const makeArray = (xs) =>
  compact(Array.isArray(xs) ? xs : [xs]);

const executeAsArray = (input, next) =>
  !Array.isArray(input) ? next(input) : input.map(next);

const toArray = (xs) =>
  compact(Array.isArray(xs) ? xs : [xs]);

const decorateGlob = (xs) => {
  let output = xs.glob;
  if (xs.wildcard) output = `*${output}*`;
  if (xs.negate) output = `!${output}`;
  return output;
};

const cleanFields = (xs, target) =>
  compact(
    map(xs, (item) => {
      if (!item) return null;
      if (!isObject(item)) return item;

      const test = makeArray(item.test);

      return !size(test) ||
        new Comparison(test).eval(target)
        ? decorateGlob(item)
        : null;
    }),
  ).sort((a, b) => {
    if (b.startsWith('!')) return -1;
    return 0;
  });

const flattenAndReduceByFields = (
  doc,
  grant = {},
  options = {},
) => {
  if (!doc) return null;

  const { includeConditionalGlobs = false } = options;
  const flat = flatten(doc);

  const patterns = cleanFields(
    uniq(
      [
        toArray(get(grant, 'fields')),
        ['Create', 'Update'].includes(grant.op)
          ? [
              '!*updatedAt*',
              '!*createdAt*',
              '!*createdBy*',
              '!*lastModifiedBy*',
              '!*_id*',
              '!*__t*',
            ]
          : [],
      ].flat(2),
    ).map((item) => {
      if (includeConditionalGlobs && isObject(item)) {
        return decorateGlob(item);
      }

      return item;
    }),
    doc,
  );

  const unwind = micromatch(
    Object.keys(flat),
    patterns,
  ).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: flat[key],
      }),
    {},
  );

  return unflatten(unwind);
};

const clean = (output) =>
  Array.isArray(output)
    ? output.filter(
        (v) =>
          v !== null &&
          typeof v === 'object' &&
          Object.keys(v).length,
      )
    : output;

const Redact = (data, user, collectionName) =>
  new Promise((resolve) => {
    try {
      const accessControl = new Grant(user)
        .can('Read')
        .on(collectionName);

      const runTest = (doc) =>
        flattenAndReduceByFields(
          doc,
          // must do this during the callback
          // as not all documents will contain the same alias conditions
          accessControl.test(doc),
        );

      const output = executeAsArray(data, runTest);
      resolve(clean(output));
    } catch (e) {
      resolve(data);
    }
  });

Redact.flattenAndReduceByFields = flattenAndReduceByFields;
Redact.clean = clean;

module.exports = Redact;
