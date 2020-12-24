const ng = require('n-gram');
const {
  isPlainObject,
  lowerCase,
  trim,
  compact,
  uniq,
  min,
  max,
} = require('lodash');
const { compose } = require('lodash/fp');

const clean = compose(
  (v) => v.replace(/[^a-zA-Z0-9]/g, '').replace(/\s/g, ''),
  lowerCase,
  trim,
);

const getField = (prop) => (field) =>
  isPlainObject(field) ? field[prop] : field;

const mapFields = (fields = [], prop) =>
  fields.map(getField(prop));

const getFieldNameOfGram = (f) => `${f}_ngram`;

const getGramOptions = (name, opts = {}) =>
  opts.minGramSize || opts.maxGramSize
    ? { ...opts, name }
    : name;

const getRange = (fields, search = '') => {
  const maxValue = max(mapFields(fields, 'maxGramSize'));

  const minValue = Math.max(
    min(mapFields(fields, 'minGramSize')),
    max(search.split(' ').map((v) => v.length)),
  );

  return [Math.min(minValue, maxValue), maxValue];
};

const makeGram = (str, minGramSize = 2, maxGramSize = 4) =>
  uniq(
    compact(
      Array.from({
        length: maxGramSize,
      })
        .fill(clean(str))
        .map((val, ind) => {
          const size = ind + 1;
          const g = ng(size);
          return size >= minGramSize ? g(str) : [];
        })
        .flat(2),
    ),
  );

const quote = (v) => `"${v}"`;

const reduceIndex = (fields = []) =>
  fields.reduce((acc, curr) => {
    const name = isPlainObject(curr) ? curr.name : curr;
    acc[name] = 'text';
    acc[getFieldNameOfGram(name)] = 'text';
    return acc;
  }, {});

const reduceSearchableFields = (fields = [], doc) =>
  fields.reduce((acc, curr) => {
    const {
      maxGramSize,
      minGramSize,
      name,
    } = !isPlainObject(curr) ? { name: curr } : curr;

    acc[getFieldNameOfGram(name)] = makeGram(
      doc[name],
      minGramSize,
      maxGramSize,
    );

    return acc;
  }, {});

module.exports = {
  clean,
  getFieldName: getField('name'),
  getGramOptions,
  getRange,
  makeGram,
  quote,
  reduceIndex,
  reduceSearchableFields,
};
