const ng = require('n-gram');
const {
  lowerCase,
  trim,
  compact,
  get,
  uniq,
} = require('lodash');
const { compose } = require('lodash/fp');

const MAX_LENGTH = 8;

const clean = compose(
  (v) => v.replace(/[^a-zA-Z0-9]/g, ''),
  lowerCase,
  trim,
);

const makeArrayFromMaxLength = (fn) =>
  Array.from({
    length: MAX_LENGTH,
  }).map(fn);

const getGramCollectionName = (instance) =>
  compact([
    get(instance, 'collection.collectionName'),
    'ngrams',
  ]).join('-');

const getGramCollection = (instance) =>
  instance.db.collection(getGramCollectionName(instance));

const makeSingleGram = (v) => (item, n) =>
  ng(n + 1)(clean(v));

const makeGram = (doc = {}) =>
  uniq(
    Object.values(doc)
      .map((v) => [
        clean(v),
        makeArrayFromMaxLength(makeSingleGram(v)),
      ])
      .flat(3)
      .map(clean),
  );

module.exports = {
  clean,
  getGramCollection,
  makeGram,
};
