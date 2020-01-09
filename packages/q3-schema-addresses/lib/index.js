const { exception } = require('q3-core-responder');
const Schema = require('./schema');
const { STATES, PROVINCES } = require('./constants');
const adapters = require('./adapterStrategies');

function ensureSingleBilling(next) {
  let err;
  if (
    this.addresses &&
    this.addresses.filter(
      (address) => address.kind === 'Billing',
    ).length > 1
  )
    err = exception('Validation')
      .msg('singularity')
      .field({
        name: 'kind',
        msg: 'singularBillingAddress',
        value: 'Billing',
      })
      .boomerang();

  next(err);
}

Schema.path('region').validate(function verifyGeo(v) {
  if (
    (this.country === 'CA' && STATES.includes(v)) ||
    (this.country === 'US' && PROVINCES.includes(v))
  )
    exception('Valiation')
      .msg('match')
      .field({
        name: 'region',
        value: v,
        msg: 'inaccurateRegion',
      })
      .throw();

  return true;
});

Schema.ensureSingleBilling = ensureSingleBilling;
Schema.methods.normalize = adapters;

module.exports = Schema;
