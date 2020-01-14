const micromatch = require('micromatch');
const { round, compact } = require('lodash');
const { CUSTOM, VOLUME } = require('./constants');

const isFloat = (v) => v === CUSTOM || v === VOLUME;

const multiply = (a, b) => a * b;
const increment = (a, b, c) => c - (1 - a) * b;

const isPercent = (v) =>
  ['Incremental', 'Factor'].includes(v);

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
  let pattern = compact(v.resource);
  if (!pattern) pattern = ['!*'];
  if (!name) return false;

  return micromatch.isMatch(name, pattern, {
    nocase: true,
  });
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

const compareValues = (discounts = [], pricing) => {
  return discounts.reduce(
    (prev, next) =>
      prev.diff(pricing) < next.diff(pricing) ? next : prev,
    discounts[0],
  );
};

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

const toFixed = (num, fb) =>
  round(Number.isNaN(num) ? fb : num, 2);

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
  toFixed,
};
