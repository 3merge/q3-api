const { flatten, unflatten } = require('flat');
const Comparison = require('comparisons');
const micromatch = require('micromatch');
const { isPlainObject, compact, size } = require('lodash');
const Grant = require('./grant');

const makeArray = (xs) =>
  compact(Array.isArray(xs) ? xs : [xs]);

const executeAsArray = (input, next) =>
  !Array.isArray(input) ? next(input) : input.map(next);

const cleanFields = (xs, target) =>
  compact(
    (Array.isArray(xs) ? xs : [xs]).map((item) => {
      if (!item) return null;
      if (!isPlainObject(item)) return item;

      let output = item.glob;
      if (item.wildcard) output = `*${output}*`;
      if (item.negate) output = `!${output}`;

      const test = makeArray(item.test);

      return !size(test) ||
        new Comparison(test).eval(target)
        ? output
        : null;
    }),
  ).sort((a, b) => {
    if (b.startsWith('!')) return -1;
    return 0;
  });

const flattenAndReduceByFields = (doc, grant = {}) => {
  if (!doc) return null;

  const flat = flatten(doc);
  const match =
    isPlainObject(grant) && 'fields' in grant
      ? micromatch(
          Object.keys(flat),
          cleanFields(grant.fields, doc),
        )
      : [];

  const unwind = match.reduce(
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
