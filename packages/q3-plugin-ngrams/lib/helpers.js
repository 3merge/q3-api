const ng = require('n-gram');
const {
  get,
  isPlainObject,
  lowerCase,
  trim,
  compact,
  uniq,
  min,
  max,
} = require('lodash');
const { compose } = require('lodash/fp');

const chunk = (v, num) =>
  v.match(new RegExp(`.{1,${num}}`, 'g'));

const castToDoubleQuotes = (threshold) => (v) =>
  v.length === threshold ? `"${v}"` : v;

const clean = compose(
  (v) => v.replace(/[^a-zA-Z0-9]/g, '').replace(/\s/g, ''),
  lowerCase,
  trim,
);

const filterByLength = (a) =>
  a.filter((item = '') => item.trim());

const getField = (prop) => (field) =>
  isPlainObject(field) ? field[prop] : field;

const getFieldNameOfGram = (f) => `${f}_ngram`;

const getGrams = (decorator) => (fields) =>
  decorator(fields.map(getField('gram')));

const getMaxGram = getGrams(max);
const getMinGram = getGrams(min);

const getGramSize = (obj = {}) =>
  get(obj, 'options.gram') > 1
    ? Number(obj.options.gram)
    : 0;

const getRange = (fields, search = '') => {
  if (!search || !search.length) return [1, 1];

  const maxValue = getMaxGram(fields);
  const minValue = Math.max(
    getMinGram(fields),
    max(search.split(' ').map((v) => v.length)),
  );

  return [Math.min(minValue, maxValue), maxValue];
};

const hasLengthGreaterThan = (
  str = '',
  expectedLength = 0,
) => str.length > expectedLength;

const makeGram = (str, minGramSize, maxGramSize) =>
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

const mapWord = (str = '', fn) =>
  str.split(' ').map(fn).flat(2).join(' ');

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
    const { gram, name } = !isPlainObject(curr)
      ? { name: curr }
      : curr;

    acc[getFieldNameOfGram(name)] = makeGram(
      doc[name],
      gram,
      getMaxGram(fields),
    );

    return acc;
  }, {});

module.exports = {
  castToDoubleQuotes,
  chunk,
  clean,
  filterByLength,
  getFieldName: getField('name'),
  getGramSize,
  getRange,
  hasLengthGreaterThan,
  makeGram,
  mapWord,
  quote,
  reduceIndex,
  reduceSearchableFields,
};
