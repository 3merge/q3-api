const moment = require('moment');
const micromatch = require('micromatch');
const { clamp, round } = require('lodash');
const {
  INCREMENTAL_MSRP,
  INCREMENTAL_VOLUME,
  INCREMENTAL_RETAIL,
  RETAIL,
  VOLUME,
  MSRP,
} = require('./constants');

const hasNotBegun = (d = {}) =>
  !d.effective || moment(d.effective).isBefore(new Date());

const hasExpired = (d = {}) =>
  !d.expiry || moment(d.expiry).isAfter(new Date());

const isFloat = (v) => v === RETAIL || v === VOLUME;

const multiply = (a, b) => a * b;
const increment = (a, b, c) => c - (1 - a) * b;

const isPercent = (v) =>
  [
    MSRP,
    INCREMENTAL_MSRP,
    INCREMENTAL_VOLUME,
    INCREMENTAL_RETAIL,
  ].includes(v);

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
  let pattern = v.resource;
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

function toFactor(v) {
  if (isPercent(this.kind)) return (100 - v) / 100;
  if (isFloat(this.kind)) return clamp(v, 0, 1.5);
  return v;
}

function fromFactor(v) {
  this.rawFactor = v;
  return isPercent(this.kind) ? 100 - v * 100 : v;
}

const compareValues = (discounts = [], pricing) => {
  return discounts.reduce(
    (prev, next) =>
      prev.diff(pricing) < next.diff(pricing) ? next : prev,
    discounts[0],
  );
};

const returnHeaviestDiscountFromSortedArray = (a, pricing) =>
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
  toFactor,
  fromFactor,
  hasNotBegun,
  hasExpired,
  filterByTaxonomy,
  filterByResourceName,
  returnHeaviestDiscountFromSortedArray,
  compareValues,
  multiply,
  increment,
  toFixed,
};
