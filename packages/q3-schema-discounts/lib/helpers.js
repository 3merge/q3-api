const BigNumber = require('bignumber.js');
const { compact } = require('lodash');
const glob = require('glob-to-regexp');
const { CUSTOM, VOLUME } = require('./constants');

const isFloat = (v) => v === CUSTOM || v === VOLUME;

const multiply = (a, b) =>
  new BigNumber(a).multipliedBy(b).toNumber();

const toFactor = (a) =>
  new BigNumber(a).dividedBy(100).toNumber();

const reduceBy = (a, b) =>
  new BigNumber(a).minus(b).toNumber();

const toFactorOfOne = (a) => reduceBy(1, toFactor(a));

const increment = (a, b, c) =>
  new BigNumber(c)
    .minus(
      new BigNumber(1).minus(a).multipliedBy(b).toNumber(),
    )
    .toNumber();

const isPercent = (v) =>
  ['Incremental', 'Factor'].includes(v);

const asNumber = (num, fb) =>
  Number.isNaN(num) ? fb : num;

const filterByTaxonomy = (id) => (v) => {
  try {
    return v.taxonomy.equals(id);
  } catch (err) {
    try {
      return v.taxonomy.id.equals(id);
    } catch (e) {
      return false;
    }
  }
};

const filterByResourceName = (name) => (v) => {
  const test = (re) =>
    re === name || glob(re, { flags: 'i' }).test(name);

  let pattern = compact(v.resource);

  if (!pattern) pattern = ['!*'];
  if (!name) return false;

  return Array.isArray(pattern)
    ? pattern.some(test)
    : test(pattern);
};

const splitCommaDelimited = (a) => {
  if (Array.isArray(a)) return a;
  if (typeof a === 'string')
    return a
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  return null;
};

const compareValues = (discounts = [], pricing) =>
  discounts.reduce(
    (prev, next) =>
      prev.diff(pricing) < next.diff(pricing) ? next : prev,
    discounts[0],
  );

const returnHeaviestDiscountFromSortedArray = (
  a,
  pricing,
) =>
  a
    .map((discounts) =>
      Array.isArray(discounts) && discounts.length
        ? compareValues(discounts, pricing)
        : null,
    )
    .filter(Boolean)
    .shift();

module.exports = {
  isFloat,
  isPercent,
  splitCommaDelimited,
  filterByTaxonomy,
  filterByResourceName,
  returnHeaviestDiscountFromSortedArray,
  compareValues,
  multiply,
  increment,
  asNumber,
  toFactorOfOne,
  reduceBy,
};
