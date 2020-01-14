const {
  multiply,
  increment,
  toFixed,
} = require('./helpers');

const hasKeys = (o) => o && Object.keys(o).length;
const getKey = (o = {}, key) => o[key] || 0;

const getOptions = (o) =>
  o && o.constructor && o.constructor.schema
    ? o.constructor.schema.options
    : {};

module.exports = class DiscountDecorator {
  evaluate(pricingScheme) {
    if (!hasKeys(pricingScheme)) return 0;

    const { base } = getOptions(this);
    const { factor, formula, strategy } = this;
    const input = getKey(pricingScheme, strategy);
    const previous =
      this.base || getKey(pricingScheme, base);

    const toFixedIfDefined = (v) =>
      input ? toFixed(v) : previous;

    switch (formula) {
      case 'Fixed':
        return toFixed(factor);
      case 'Factor':
        return toFixedIfDefined(multiply(factor, input));
      case 'Compound':
        return toFixed(previous - factor);
      case 'Incremental':
        return toFixedIfDefined(
          increment(factor, input, previous),
        );
      default:
        return toFixed(input);
    }
  }

  diff(pricingScheme) {
    const { base } = getOptions(this);
    const v = getKey(pricingScheme, base);
    return toFixed(v - this.evaluate(pricingScheme), 0);
  }
};
