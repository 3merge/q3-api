const { exception } = require('q3-core-responder');

exports.conditionalSkuThreshold = {
  validator(v) {
    return (
      !v ||
      (this.conditionalSkus !== undefined &&
        this.conditionalSkus !== null &&
        this.conditionalSkus.length)
    );
  },
  message: () =>
    exception('Validation')
      .msg('requiresConditionalSkus')
      .boomerang().message,
};
