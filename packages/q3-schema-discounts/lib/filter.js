/* eslint-disable no-param-reassign */
const { get } = require('lodash');
const {
  hasExpired,
  hasNotBegun,
  filterByResourceName,
  filterByTaxonomy,
  returnHeaviestDiscountFromSortedArray,
} = require('./helpers');

const {
  RETAIL,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_VOLUME,
  INCREMENTAL_RETAIL,
  CUSTOM,
} = require('./constants');

module.exports = class DiscountFilter {
  constructor(doc, pathname) {
    this.discounts = get(doc, pathname, []);
  }

  $getEligibleDiscounts(done = Boolean) {
    return this.discounts
      .filter(hasExpired)
      .filter(hasNotBegun)
      .filter(done);
  }

  $getDiscountByResourceName(name, done = Boolean) {
    return this.$getEligibleDiscounts(
      filterByResourceName(name),
    ).filter(done);
  }

  $getDiscountByResourceNameAndKind(name, kinds = []) {
    return this.$getDiscountByResourceName(name, ({ kind }) =>
      kinds.includes(kind),
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
      INCREMENTAL_MSRP,
      INCREMENTAL_RETAIL,
      INCREMENTAL_VOLUME,
    ]);
  }

  getCustomDiscountByResourceName(name) {
    return this.$getDiscountByResourceNameAndKind(name, [
      CUSTOM,
    ]);
  }

  getDiscountByResourceName(name) {
    return this.$getDiscountByResourceNameAndKind(name, [
      RETAIL,
      VOLUME,
      MSRP,
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
        this.getCustomDiscountByResourceName(name),
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

    if (a) return a;
    if (b) return b;
    return null;
  }
};
