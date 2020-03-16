/* eslint-disable no-param-reassign */
const {
  filterByResourceName,
  filterByTaxonomy,
  compareValues,
} = require('./helpers');

module.exports = class DiscountFilter {
  constructor(docs = []) {
    this.discounts = docs;
  }

  $getEligibleDiscounts(done = Boolean) {
    return this.discounts
      .filter((v) => !v.hasExpired())
      .filter((v) => !v.hasNotYetBegun())
      .filter(done);
  }

  $getDiscountByResourceName(name, done = Boolean) {
    return this.$getEligibleDiscounts(
      filterByResourceName(name),
    ).filter(done);
  }

  $getDiscountByResourceNameAndKind(name, kinds = []) {
    return this.$getDiscountByResourceName(
      name,
      ({ formula }) => kinds.includes(formula),
    );
  }

  getDiscountByTaxonomy(taxonomy) {
    return this.$getEligibleDiscounts(
      filterByTaxonomy(taxonomy),
    );
  }

  getGlobalDiscount() {
    return this.$getEligibleDiscounts((v) => v.global);
  }

  getIncrementalDiscountByResourceName(name) {
    return this.$getDiscountByResourceNameAndKind(name, [
      'Incremental',
      'Compound',
    ]);
  }

  getFixedDiscountByResourceName(name) {
    return this.$getDiscountByResourceNameAndKind(name, [
      'Fixed',
    ]);
  }

  getDiscountByResourceName(name) {
    return this.$getDiscountByResourceNameAndKind(name, [
      'Factor',
      'Percent',
    ]);
  }

  getBaseDiscount(name, taxonomy, pricing = {}) {
    return compareValues(
      [
        ...this.getDiscountByResourceName(name),
        ...this.getDiscountByTaxonomy(taxonomy),
        ...this.getGlobalDiscount(),
      ],
      pricing,
    );
  }

  getAugmentedDiscount(name, pricing = {}) {
    return compareValues(
      [
        ...this.getFixedDiscountByResourceName(name),
        ...this.getIncrementalDiscountByResourceName(name),
      ],
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
