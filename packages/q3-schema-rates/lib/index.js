/* eslint-disable func-names */
const { exception } = require('q3-core-responder');
const Schema = require('./schema');
const Decorator = require('./decorator');

Schema.path('value').set(function(v) {
  this.$lastValue = this.value;
  return v;
});

Schema.pre('save', async function checkForDuplicateRates(next) {
  let err;
  const { name, value, threshold } = this;

  if (
    this.isNew &&
    (await this.constructor.countDocuments({
      name,
      value,
      threshold,
    }))
  )
    err = exception('Validation')
      .msg('duplicate')
      .boomerang();

  next(err);
});

Schema.loadClass(Decorator);
module.exports = Schema;
