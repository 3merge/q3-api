/* eslint-disable no-param-reassign */
const {
  filterByResourceName,
  filterByTaxonomy,
  compareValues,
} = require('./helpers');

const filterBySimpleDiscountFormula =
  (kinds) =>
  ({ formula }) => {
    try {
      return kinds.includes(formula);
    } catch (e) {
      return false;
    }
  };

const isWithinTimeFrame = (doc) =>
  doc && !doc.hasExpired() && !doc.hasNotYetBegun();

const isAugmented = filterBySimpleDiscountFormula([
  'Incremental',
  'Compound',
  'Distance',
  'Fixed',
]);

const isBase = filterBySimpleDiscountFormula([
  'Factor',
  'Percent',
]);

module.exports = class DiscountFilter {
  constructor(docs = []) {
    Object.assign(
      this,
      docs.reduce(
        (acc, curr) => {
          if (isWithinTimeFrame(curr)) {
            if (isBase(curr)) acc.__$base.push(curr);
            else if (isAugmented(curr))
              acc.__$augmented.push(curr);
          }

          return acc;
        },
        {
          __$augmented: [],
          __$base: [],
        },
      ),
    );
  }

  getBaseDiscount(name, taxonomy, pricing = {}) {
    const matchesResource = filterByResourceName(name);
    const matchesTaxonomy = filterByTaxonomy(taxonomy);

    return compareValues(
      this.__$base.filter(
        (curr) =>
          matchesResource(curr) ||
          matchesTaxonomy(curr) ||
          curr.global,
      ),
      pricing,
    );
  }

  getAugmentedDiscount(name, pricing = {}) {
    return compareValues(
      this.__$augmented.filter(filterByResourceName(name)),
      pricing,
    );
  }

  getBlendedDiscount(
    name,
    taxonomy,
    pricing = {},
    verbose = false,
  ) {
    const b = this.getBaseDiscount(name, taxonomy, pricing);

    const discounted = b ? b.evaluate(pricing) : null;
    const a = this.getAugmentedDiscount(
      name,
      Object.assign(pricing, {
        discounted,
      }),
    );

    if (a) {
      a.base = discounted;
      if (verbose) a.trail = [b];
      return a;
    }

    if (b) return b;
    return null;
  }
};
