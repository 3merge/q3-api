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

Schema.virtual('print').get(
  function assembleAddressParts() {
    const out = [];

    const clean = (v, char = ' ') =>
      v.filter(Boolean).join(char);

    out.push(
      clean([
        this.streetNumber,
        this.streetLine1,
        this.streetLine2,
      ]),
    );

    out.push(clean([this.city, this.region], ', '));
    out.push(clean([this.country, this.postal]));

    if (this.company) out.unshift(this.company);

    return out;
  },
);

Schema.ensureSingleBilling = ensureSingleBilling;
Schema.methods.normalize = adapters;

module.exports = Schema;
