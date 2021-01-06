const ng = require('n-gram');
const flat = require('flat');
const {
  get,
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
  if (v.length < MIN_GRAM_SIZE) return v;

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

const hasLengthGreaterThan = (
  str = '',
  expectedLength = 0,
) => str.length > expectedLength;

const makeGram = (str) => {
  if (
    !str ||
    ['false', 'null', 'true', 'undefined'].includes(
      String(str),
    )
  )
    return [];

  return uniq(
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
        .concat(String(str).match(/\b(\w)/g))
        .flat(2),
    ),
  );
};

const quote = (v) => `"${v}"`;

const reduceIndex = (fields = []) =>
  fields.reduce(
    (acc, name) =>
      Object.assign(acc, {
        [name]: 'text',
      }),
    {
      ngrams: 'text',
    },
  );

const invokeJson = (d) => ('toJSON' in d ? d.toJSON() : d);

const makeRegexForEmbeddedDocumentPaths = (pathname = '') =>
  new RegExp(
    `^${pathname.replace(/\./g, '\\.(\\d+\\.)?')}$`,
  );

const makeDocumentPaths = compose(
  Object.keys,
  flat,
  invokeJson,
);

const castToDotNotation = (doc = {}) => (field) =>
  makeDocumentPaths(doc).filter((f) =>
    makeRegexForEmbeddedDocumentPaths(field).test(f),
  );

const reduceSearchableFields = (fields = [], doc) => {
  const getIn = (field) => makeGram(get(doc, field));

  const caster = castToDotNotation(doc);
  const ngrams = uniq(
    fields.flatMap(caster).flatMap(getIn),
  );

  return {
    ngrams,
  };
};

module.exports = {
  between,
  castToDoubleQuotes,
  castToDotNotation,
  chunk,
  clean,
  filterByLength,
  hasLengthGreaterThan,
  makeGram,
  quote,
  reduceIndex,
  reduceSearchableFields,
};
