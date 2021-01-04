const ng = require('n-gram');
const {
  get,
  isPlainObject,
  lowerCase,
  trim,
  compact,
  uniq,
} = require('lodash');
const { compose } = require('lodash/fp');
const {
  MAX_GRAM_SIZE,
  MIN_GRAM_SIZE,
} = require('./constants');

const between = (a, b, c) => a < b && a > c;

const chunk = (v) => {
  const out = [];
  const re = new RegExp(
    `.{${MIN_GRAM_SIZE},${MAX_GRAM_SIZE}}`,
    'g',
  );

  let remainder = v;

  while (remainder.length > 1) {
    let chunkSize = MAX_GRAM_SIZE;
    let divisible = Math.floor(
      remainder.length / MAX_GRAM_SIZE,
    );

    while (
      between(
        remainder.length % (divisible * chunkSize),
        MIN_GRAM_SIZE,
        0,
      )
    ) {
      if (divisible) {
        divisible -= 1;
      }

      if (!divisible) {
        chunkSize -= 1;
      }
    }

    out.push(remainder.substr(0, chunkSize));
    remainder = remainder.substr(chunkSize);
  }

  return uniq(out.concat(v.match(re)));
};

const castToDoubleQuotes = (v) => `"${v}"`;

const clean = compose(
  (v) => v.replace(/[^a-zA-Z0-9]/g, ''),
  lowerCase,
  trim,
);

const filterByLength = (a) =>
  a.filter((item = '') => item.trim());

const getField = (prop) => (field) =>
  isPlainObject(field) ? field[prop] : field;

const getFieldNameOfGram = (f) => `${f}_ngram`;

const hasLengthGreaterThan = (
  str = '',
  expectedLength = 0,
) => str.length > expectedLength;

const makeGram = (str) =>
  uniq(
    compact(
      Array.from({
        length: MAX_GRAM_SIZE,
      })
        .fill(clean(str))
        .map((val, ind) => {
          const size = ind + 1;
          const g = ng(size);
          return size >= MIN_GRAM_SIZE ? g(val) : [];
        })
        .flat(2),
    ),
  );

const quote = (v) => `"${v}"`;

const reduceIndex = (fields = []) =>
  fields.reduce((acc, name) => {
    acc[name] = 'text';
    acc[getFieldNameOfGram(name)] = 'text';
    return acc;
  }, {});

const reduceSearchableFields = (fields = [], doc) =>
  fields.reduce((acc, name) => {
    acc[getFieldNameOfGram(name)] = makeGram(
      get(doc, name),
    );
    return acc;
  }, {});

module.exports = {
  between,
  castToDoubleQuotes,
  chunk,
  clean,
  filterByLength,
  getFieldName: getField('name'),
  hasLengthGreaterThan,
  makeGram,
  quote,
  reduceIndex,
  reduceSearchableFields,
};
