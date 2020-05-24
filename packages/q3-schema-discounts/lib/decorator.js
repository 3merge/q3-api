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
    const { target } = getOptions(this);
    const { base, factor, formula, strategy } = this;

    const input = getKey(pricingScheme, strategy);
    const fallback = getKey(
      pricingScheme,
      target || strategy,
    );

    const asNumberIfDefined = (v) =>
      input ? asNumber(v) : fallback;

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
          reduceBy(base || fallback, factor),
        );
      case 'Distance':
        return asNumberIfDefined(
          increment(
            toFactorOfOne(factor),
            input,
            getKey(pricingScheme, target),
          ),
        );
      case 'Incremental':
        return !base && !fallback
          ? getKey(pricingScheme, strategy)
          : asNumberIfDefined(
              increment(
                toFactorOfOne(factor),
                input,
                base || fallback,
              ),
            );
      default:
        return asNumber(input);
    }
  }

  diff(pricingScheme) {
    const { target } = getOptions(this);
    return asNumber(
      getKey(pricingScheme, target) -
        this.evaluate(pricingScheme),
      0,
    );
  }
};
