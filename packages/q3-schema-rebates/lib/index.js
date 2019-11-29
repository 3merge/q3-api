const { exception } = require('q3-core-responder');
const Decorator = require('./decorator');
const Schema = require('./schema');

Schema.loadClass(Decorator);

Schema.pre('save', function conditionalRequirements() {
  if (
    (!this.couponCode && !this.requiredSkus) ||
    (this.couponCode && this.requiredSkus)
  )
    exception('Validation')
      .msg('codeOrSku')
      .field('couponCode')
      .field('requiredSkus')
      .throw();
});

module.exports = Schema;
