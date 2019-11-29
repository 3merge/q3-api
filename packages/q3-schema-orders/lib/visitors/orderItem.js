/* eslint-disable max-classes-per-file */
const { exception } = require('q3-core-responder');
const { round, multiply } = require('lodash');
const { BEST } = require('../constants');
const SchemaVisitorChain = require('./chain');
const DynamicDiscounts = require('../utils/discounts');

module.exports = class OrderItemVisitor extends SchemaVisitorChain {
  constructor() {
    super([
      'checkAvailability',
      'checkPricing',
      'checkDiscounts',
      'calculate',
    ]);
  }

  async checkAvailability(actions) {
    const { setItemBucket } = actions;
    const { product, quantity } = this.store;

    this.store.bucket = await setItemBucket(product, quantity);

    if (!this.store.bucket)
      exception('Validation')
        .msg('productUnavailable')
        .throw();
  }

  async checkPricing(actions) {
    this.store.unmodifiedPrice = await actions.setItemUnmodifiedPrice(
      this.store.bucket,
    );

    if (
      !this.store.unmodifiedPrice ||
      this.store.unmodifiedPrice < 0
    )
      exception('Validation')
        .msg('pricingUnavailable')
        .throw();
  }

  async checkDiscounts(actions) {
    await this.checkEmbeddedArray(
      actions.automateItemDiscounts,
      'discounts',
    );
  }

  getFinalPrice() {
    const {
      store: {
        priceOverride,
        unmodifiedPrice,
        discountBy = BEST,
        discounts = [],
      },
    } = this;

    this.store.price = priceOverride
      ? priceOverride.evaluate(unmodifiedPrice)
      : new DynamicDiscounts(unmodifiedPrice, discountBy).get(
          discounts,
        );
  }

  calculate() {
    this.getFinalPrice();
    this.store.subtotal = round(
      multiply(this.store.price, this.store.quantity),
      2,
    );

    return this;
  }
};
