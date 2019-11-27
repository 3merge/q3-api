const { exception, i18n } = require('q3-core-responder');
const Decorator = require('./decorator');
const Schema = require('./schema');

i18n.addResourceBundle('en', 'errors', {
  codeOrSku:
    'Must provide either a coupon code or required sku but not both.',
});

i18n.addResourceBundle('fr', 'errors', {
  codeOrSku:
    'Doit fournir un code de coupon ou un sku requis, mais pas les deux.',
});

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
