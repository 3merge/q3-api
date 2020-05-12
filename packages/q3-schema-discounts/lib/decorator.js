const {
  multiply,
  increment,
  toFactorOfOne,
  reduceBy,
  asNumber,
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

    const { factor, formula, strategy } = this;
    const input = getKey(pricingScheme, strategy);
    const previous =
      this.base || getKey(pricingScheme, strategy);

    const asNumberIfDefined = (v) =>
      input ? asNumber(v) : previous;

    switch (formula) {
      case 'Fixed':
        return asNumber(factor);
      case 'Factor':
        return asNumberIfDefined(multiply(factor, input));
      case 'Percent':
        return asNumberIfDefined(
          multiply(input, toFactorOfOne(factor)),
        );
      case 'Compound':
        return asNumberIfDefined(
          reduceBy(previous, factor),
        );
      case 'Distance':
        return asNumberIfDefined(
          increment(
            toFactorOfOne(factor),
            input,
            getKey(pricingScheme, this.target || strategy),
          ),
        );
      case 'Incremental':
        return asNumberIfDefined(
          increment(toFactorOfOne(factor), input, previous),
        );
      default:
        return asNumber(input);
    }
  }

  diff(pricingScheme) {
    const { base } = getOptions(this);
    const v = getKey(pricingScheme, base);
    return asNumber(v - this.evaluate(pricingScheme), 0);
  }
};
