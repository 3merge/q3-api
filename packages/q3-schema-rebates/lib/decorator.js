const Utils = require('q3-schema-utils');
const {
  getRemainder,
  sofar,
  compact,
  hasLength,
} = require('./helpers');

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

  static async reduceQualifiedRebates(
    couponCode,
    items,
    opts,
    interceptor,
  ) {
    const rebates = await this.findApplicable(
      couponCode,
      items,
      opts,
    );

    return rebates
      .map((rebate) =>
        typeof interceptor === 'function'
          ? interceptor(rebate)
          : rebate,
      )
      .map((rebate) => {
        const redact = rebate.redactItems(items);
        const sorted =
          rebate.greatestPotentialValue(redact);
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
    return hasLength(this.requiredSkus)
      ? items.some(this.matchItemSku.bind(this))
      : true;
  }

  hasConditionalSkus(items) {
    if (!hasLength(this.conditionalSkus)) return true;

    const total = items.reduce(
      (acc, { sku, quantity }) =>
        Utils.isMatch(sku, compact(this.conditionalSkus))
          ? acc + quantity
          : acc,
      0,
    );

    return (
      (!this.conditionalSkuThreshold && total.length) ||
      this.conditionalSkuThreshold <= total
    );
  }

  matchItemSku(item) {
    return Utils.isMatch(
      item.sku,
      compact(this.requiredSkus),
    );
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
          Math.max(
            0,
            getRemainder(
              redeemable - sofar(accumulator),
              maximumPerProduct,
              next.quantity,
            ),
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

  evaluate(args = {}) {
    const { getPrice, quantity } = args;
    const price =
      getPrice && typeof getPrice === 'function'
        ? getPrice(this)
        : args.price;

    const { tiers = [] } = this;
    let { value } = this;
    let sum = price;

    tiers.forEach((tier) => {
      if (tier.quantity <= quantity) value = tier.value;
    });

    if (this.symbol === '%') {
      sum = price * (value / 100);
    } else {
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
