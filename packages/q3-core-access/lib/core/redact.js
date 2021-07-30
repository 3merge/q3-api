const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');
const { get } = require('lodash');
const Grant = require('./grant');
const Field = require('./field');
const { makeArray } = require('../helpers');

const executeAsArray = (input, next) =>
  !Array.isArray(input) ? next(input) : input.map(next);

const flattenAndReduceByFields = (
  doc,
  grant = {},
  options = {},
) => {
  if (!doc) return null;

  const {
    keepFlat = false,
    returnWithPatternsEarly = false,
  } = options;

  const flat = flatten(doc);
  const patterns = Field(
    [
      makeArray(get(grant, 'fields')),
      ['Create', 'Update'].includes(grant.op)
        ? [
            '!*updatedAt*',
            '!*createdAt*',
            '!*createdBy*',
            '!*lastModifiedBy*',
            '!*_id*',
          ]
        : [],
    ].flat(2),
    doc,
    options,
  );

  // useful for debugging
  if (returnWithPatternsEarly) return patterns;

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

  return !keepFlat ? unflatten(unwind) : unwind;
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
          {
            includeConditionalGlobs: true,
            user,
          },
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
