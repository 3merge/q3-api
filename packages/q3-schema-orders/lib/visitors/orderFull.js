/* eslint-disable max-classes-per-file */
const { multiply, round } = require('lodash');
const { exception } = require('q3-core-responder');
const SchemaVisitorChain = require('./chain');
const {
  addUp,
  convert,
  reducers,
} = require('../utils/helpers');

module.exports = class OrderFullVisitor extends SchemaVisitorChain {
  constructor() {
    super([
      'checkRebates',
      'checkFees',
      'checkPaymentFees',
      'checkShippingFees',
      'checkTaxes',
      'checkLocale',
      'calculateSubtotal',
      'calculateTax',
      'calculateTotal',
    ]);
  }

  async checkRebates(actions) {
    await this.checkEmbeddedArray(
      actions.automateRebates,
      'rebates',
    );
  }

  async checkFees(actions) {
    await this.checkEmbeddedArray(
      actions.automateOrderFees,
      'fees',
    );
  }

  async checkPaymentFees(actions) {
    this.store.paymentFee = await actions.setPayment(
      this.store.paymentOption,
    );
  }

  async checkShippingFees(actions) {
    this.store.shippingFee = await actions.setShipping(
      this.store.shippingOption,
    );
  }

  async checkTaxes(actions) {
    return actions.setTax
      ? Object.assign(
          this.store,
          await actions.setTax(this.store.shipping),
        )
      : Object.assign(this.store, {
          gst: 0,
          hst: 0,
          pst: 0,
        });
  }

  async checkLocale(actions) {
    if (!this.store.currency) return;
    this.store.rate = await actions.setLocale(
      this.store.currency,
    );

    if (!this.store.rate)
      exception('Validation')
        .field({ name: 'rate', msg: 'required' })
        .throw();

    if (this.store.items)
      this.store.items = this.store.items.map((item) =>
        Object.assign(item, {
          subtotal: convert(
            item.subtotal,
            item.currency,
            this.store.currency,
            this.store.rate,
          ),
        }),
      );
  }

  calculateSubtotal() {
    const {
      store: {
        globalDiscount = 0,
        shippingFee = 0,
        paymentFee = 0,
        fees = [],
        items = [],
        rebates = [],
      },
    } = this;

    let sum = 0;
    sum += items.reduce(reducers.lines, 0);
    sum -= multiply(globalDiscount / 100, sum);
    sum -= rebates.reduce(reducers.rebates(items, sum), 0);
    sum += fees.reduce(reducers.fees, 0);
    sum += shippingFee;
    sum += multiply(paymentFee / 100, sum);

    this.store.subtotal = round(sum, 2);
  }

  calculateTax() {
    const {
      store: { gst = 0, pst = 0, hst = 0, subtotal },
    } = this;

    this.store.tax = round(
      multiply(addUp(gst, pst, hst) / 100, subtotal),
      2,
    );
  }

  calculateTotal() {
    this.store.total = round(
      this.store.subtotal + this.store.tax,
      2,
    );
  }
};
