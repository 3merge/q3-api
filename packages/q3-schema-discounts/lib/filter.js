/* eslint-disable no-param-reassign */
const {
  filterByResourceName,
  filterByTaxonomy,
  returnHeaviestDiscountFromSortedArray,
} = require('./helpers');

const {
  CUSTOM,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_VOLUME,
  INCREMENTAL_CUSTOM,
  FIXED_PRICE,
} = require('./constants');

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
    ]);
  }

  getBaseDiscount(name, taxonomy, pricing = {}) {
    return returnHeaviestDiscountFromSortedArray(
      [
        this.getDiscountByResourceName(name),
        this.getDiscountByTaxonomy(taxonomy),
        this.getGlobalDiscount(),
      ],
      pricing,
    );
  }

  getAugmentedDiscount(name, pricing = {}) {
    return returnHeaviestDiscountFromSortedArray(
      [
        this.getFixedDiscountByResourceName(name),
        this.getIncrementalDiscountByResourceName(name),
      ],
      pricing,
    );
  }

  getBlendedDiscount(name, taxonomy, pricing = {}) {
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
      return a;
    }

    if (b) return b;
    return null;
  }
};
