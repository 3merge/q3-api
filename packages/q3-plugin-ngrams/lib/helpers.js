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

const addLength = (a, b) =>
  b && b.length ? a + b.length : a;

const averageSize = (a = []) =>
  a.length ? a.reduce(addLength, 0) / a.length : 0;

const between = (a, b, c) => a < b && a > c;

const splitBestCaseGramSize = (str, offset) =>
  str.match(
    new RegExp(`.{${MIN_GRAM_SIZE},${offset}}`, 'g'),
  );

const meetsGramSizeParameters = (v) =>
  v.length > MIN_GRAM_SIZE && v.length !== MAX_GRAM_SIZE;

const measureLengthOfContents = (a) => a.join('').length;

const chunk = (v) => {
  let parts = [];
  let offset = MAX_GRAM_SIZE;

  if (!meetsGramSizeParameters(v)) return [v];

  while (offset !== MIN_GRAM_SIZE) {
    offset -= 1;

    const proposedChunks = splitBestCaseGramSize(v, offset);
    const acceptedChunks = averageSize(parts);

    if (
      measureLengthOfContents(proposedChunks) ===
        v.length &&
      (averageSize(proposedChunks) >= acceptedChunks ||
        acceptedChunks === 0)
    )
      parts = proposedChunks;
  }

  return uniq(parts);
};

const castToDoubleQuotes = (v) => `"${v}"`;

/**
 * @NOTE
 * @TODO
 * Taken from q3-plugin-wordcount.
 * Should become a util
 */
const stripHtml = (xs) =>
  String(xs)
    // remove all tags
    .replace(/<[^>]+>/g, '')
    // replace multiple spaces, tabs and new lines
    .replace(/\s\s+/g, ' ')
    .trim();

const clean = compose(
  (v) => v.replace(/[^a-zA-Z0-9]/g, ''),
  lowerCase,
  stripHtml,
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
    `^${pathname.replace(
      /\./g,
      '\\.(\\d+\\.)?',
    )}((\\.\\d*)$)?$`,
  );

const makeDocumentPaths = compose(
  Object.keys,
  flat,
  invokeJson,
);

const castToDotNotation =
  (doc = {}) =>
  (field) =>
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
  splitBestCaseGramSize,
};
