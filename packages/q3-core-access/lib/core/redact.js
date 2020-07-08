const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');
const { isPlainObject } = require('lodash');
const Grant = require('./grant');

const executeAsArray = (input, next) =>
  !Array.isArray(input) ? next(input) : input.map(next);

const flattenAndReduceByFields = (doc, grant = {}) => {
  if (!doc) return null;

  const flat = flatten(doc);
  const match =
    isPlainObject(grant) && 'fields' in grant
      ? micromatch(Object.keys(flat), grant.fields)
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
