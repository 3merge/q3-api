const {
  RETAIL,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_RETAIL,
  INCREMENTAL_VOLUME,
  CUSTOM,
} = require('./constants');
const {
  multiply,
  increment,
  toFixed,
} = require('./helpers');

module.exports = class DiscountDecorator {
  evaluate({ retail = 0, volume = 0, msrp = 0 }) {
    const base = retail;
    const {
      kind,
      factor,
      rawFactor,
      incrementalHistory,
    } = this;

    const num =
      rawFactor !== undefined ? rawFactor : factor;

    const reduced = incrementalHistory
      ? incrementalHistory.base
      : retail;

    const discount = (() => {
      switch (kind) {
        case RETAIL:
          return multiply(num, retail);
        case MSRP:
          return multiply(num, msrp);
        case VOLUME:
          return multiply(num, volume);
        case INCREMENTAL_RETAIL:
          return increment(num, retail, reduced);
        case INCREMENTAL_VOLUME:
          return increment(num, volume, reduced);
        case INCREMENTAL_MSRP:
          return increment(num, msrp, reduced);
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
