const { round } = require('lodash');
const { BEST, COMPOUND, ADD } = require('../constants');

module.exports = class DynamicDiscountUtils {
  constructor(price, method) {
    if (typeof price !== 'object')
      throw new Error('Pricing object required');

    this.base = price;
    this.method = method;
  }

  static format(num) {
    return round(num < 0 ? 0 : num, 2);
  }

  lowest(a = []) {
    return DynamicDiscountUtils.format(
      this.base.retail -
        Math.max(...a.map((d) => d.diff(this.base))),
    );
  }

  compound(a = []) {
    return DynamicDiscountUtils.format(
      a.reduce(
        (acc, d) => acc - d.diff(this.base),
        this.base.retail,
      ),
    );
  }

  together(a = []) {
    return DynamicDiscountUtils.format(
      this.base.retail -
        a.reduce((acc, d) => acc + d.diff(this.base), 0),
    );
  }

  get(discounts) {
    if (
      !discounts ||
      !discounts.length ||
      ![ADD, BEST, COMPOUND].includes(this.method)
    )
      return this.base.retail;

    if (this.method === BEST) return this.lowest(discounts);
    if (this.method === COMPOUND)
      return this.compound(discounts);
    if (this.method === ADD) return this.together(discounts);
    return 0;
  }
};
