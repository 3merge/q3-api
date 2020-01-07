const Utils = require('q3-schema-utils');

const getRemainder = (a, b, c) => {
  if (a < b && a < c) return a;
  if (a > b && b < c) return b;
  if (!b && a < c) return a;
  return c;
};

const sofar = (a) => a.reduce((all, curr) => all + curr, 0);

class RebateDecorator {
  static async findApplicable(
    couponCode,
    items,
    opts = {},
  ) {
    const rebates = await this.find({
      ...(couponCode && { couponCode }),
      ...this.getDateQuery(),
      ...opts,
    }).exec();

    return rebates.filter(
      (rebate) =>
        rebate.hasRequiredSkus(items) &&
        rebate.hasConditionalSkus(items),
    );
  }

  static async reduceQualifiedRebates(couponCode, items) {
    const rebates = await this.findApplicable(
      couponCode,
      items,
    );

    return rebates.map((rebate) => {
      const redact = rebate.redactItems(items);
      const sorted = rebate.greatestPotentialValue(redact);
      const amounts = rebate.getMaximumAmounts(sorted);
      const values = rebate.getPriceValues(sorted);

      // eslint-disable-next-line
      const output = rebate.toJSON();
      output.applicableTo = sorted.map((item, i) => ({
        id: item.id,
        value: values[i],
        amount: amounts[i],
      }));

      return output;
    });
  }

  reduceItems(items) {
    const redact = this.redactItems(items);
    const sorted = this.greatestPotentialValue(redact);
    const amounts = this.getMaximumAmounts(sorted);
    const values = this.getPriceValues(sorted);

    this.applicableTo = sorted.map((item, i) => ({
      id: item.id,
      value: values[i],
      amount: amounts[i],
    }));

    return this;
  }

  hasRequiredSkus(items) {
    return this.requiredSkus
      ? items.some(this.matchItemSku.bind(this))
      : true;
  }

  hasConditionalSkus(items) {
    if (!this.conditionalSkus) return true;

    const total = items.reduce(
      (acc, { sku, quantity }) =>
        Utils.isMatch(sku, this.conditionalSkus)
          ? acc + quantity
          : acc,
      0,
    );

    return (
      (!this.conditionalSkuThreshold && total.length) ||
      this.conditionalSkuThreshold < total
    );
  }

  matchItemSku(item) {
    return Utils.isMatch(item.sku, this.requiredSkus);
  }

  redactItems(items) {
    return items.filter(this.matchItemSku.bind(this));
  }

  getMaximumAmounts(items, query) {
    const { maximumPerProduct } = this;
    const redeemable = this.getRedeemable(query);

    return items.reduce(
      (accumulator, next) =>
        accumulator.concat(
          getRemainder(
            redeemable - sofar(accumulator),
            maximumPerProduct,
            next.quantity,
          ),
        ),
      [],
    );
  }

  getPriceValues(items) {
    return items.reduce(
      (accumulator, next) =>
        accumulator.concat(this.evaluate(next)),
      [],
    );
  }

  greatestPotentialValue(items) {
    const redeemable = this.getRedeemable();
    const { maximumPerProduct } = this;

    const multiply = (item) => {
      const quantity = getRemainder(
        redeemable,
        maximumPerProduct,
        item.quantity,
      );

      return (
        this.evaluate({ ...item, quantity }) * quantity
      );
    };

    return items.sort((a, b) => multiply(b) - multiply(a));
  }

  evaluate({ price, quantity, currency: defaultCurrency }) {
    const { currency, exchangeRate = 1, tiers = [] } = this;
    let { value } = this;
    let sum = price;

    tiers.forEach((tier) => {
      if (tier.quantity <= quantity) value = tier.value;
    });

    if (this.symbol === '%') {
      sum = price * (value / 100);
    } else {
      value = this.convert(
        value,
        currency,
        defaultCurrency,
        exchangeRate,
      );

      if (this.symbol === '=') sum = price - value;
      if (this.symbol === '$') sum = value;
    }

    return Utils.round(sum);
  }

  getRedeemable() {
    const {
      maximumPerOrder,
      maximumPerHistory,
      historicalCount = 0,
    } = this;
    let redeemable = Infinity;

    if (maximumPerOrder) {
      redeemable = maximumPerOrder;
    }

    if (maximumPerHistory) {
      redeemable =
        redeemable > maximumPerHistory - historicalCount
          ? maximumPerHistory - historicalCount
          : redeemable;
    }

    return redeemable;
  }

  sum() {
    const { applicableTo = [] } = this;
    return applicableTo.reduce(
      (prev, next) => prev + next.value * next.amount,
      0,
    );
  }

  setRate(v) {
    this.exchangeRate = v;
    return this;
  }

  async setHistoricalCount() {
    if (
      this.historicalCount ||
      typeof this.queryHistory !== 'function'
    )
      return;

    this.historicalCount = await this.queryHistory(this);
  }
}

module.exports = RebateDecorator;
