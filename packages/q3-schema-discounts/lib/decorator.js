const {
  CUSTOM,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_CUSTOM,
  INCREMENTAL_VOLUME,
  FIXED_PRICE,
} = require('./constants');
const {
  multiply,
  increment,
  toFixed,
} = require('./helpers');

module.exports = class DiscountDecorator {
  evaluate({ custom = 0, volume = 0, msrp = 0 }) {
    const {
      kind,
      factor,
      rawFactor,
      incrementalHistory,
    } = this;

    const num =
      rawFactor !== undefined ? rawFactor : factor;

    const reduced =
      incrementalHistory && incrementalHistory.base
        ? incrementalHistory.base
        : custom;

    const discount = (() => {
      switch (kind) {
        case CUSTOM:
          return multiply(num, custom);
        case MSRP:
          if (!msrp) return custom;
          return multiply(num, msrp);
        case VOLUME:
          if (!volume) return custom;
          return multiply(num, volume);
        case INCREMENTAL_CUSTOM:
          return increment(num, custom, reduced);
        case INCREMENTAL_VOLUME:
          if (!volume) return custom;
          return increment(num, volume, reduced);
        case INCREMENTAL_MSRP:
          if (!msrp) return custom;
          return increment(num, msrp, reduced);
        case FIXED_PRICE:
          return num;
        default:
          return custom;
      }
    })();

    return toFixed(discount, custom);
  }

  diff(v = {}) {
    const { custom } = v;
    console.log(custom);
    const num = custom - this.evaluate(v);
    return toFixed(num, 0);
  }
};
