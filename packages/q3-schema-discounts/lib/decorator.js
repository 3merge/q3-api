const {
  RETAIL,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_RETAIL,
  INCREMENTAL_VOLUME,
  CUSTOM,
} = require('./constants');
const { multiply, increment, toFixed } = require('./helpers');

module.exports = class DiscountDecorator {
  evaluate({
    discounted = 0,
    retail = 0,
    volume = 0,
    msrp = 0,
  }) {
    const base = discounted || retail;
    const { kind, factor, rawFactor } = this;
    const num = rawFactor !== undefined ? rawFactor : factor;

    const discount = (() => {
      switch (kind) {
        case RETAIL:
          return multiply(num, retail);
        case MSRP:
          return multiply(num, msrp);
        case VOLUME:
          return multiply(num, volume);
        case INCREMENTAL_RETAIL:
          return increment(num, retail, base);
        case INCREMENTAL_VOLUME:
          return increment(num, volume, base);
        case INCREMENTAL_MSRP:
          return increment(num, msrp, base);
        case CUSTOM:
          return num;
        default:
          return retail;
      }
    })();

    return toFixed(discount, retail);
  }

  diff(v = {}) {
    const { retail } = v;
    const num = retail - this.evaluate(v);
    return toFixed(num, 0);
  }
};
