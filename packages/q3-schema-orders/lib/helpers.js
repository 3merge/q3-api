const { exception } = require('q3-core-responder');
const {
  READY_FOR_DELIVERY,
  STEPS_PAID,
} = require('./constants');

function validateStatus(v) {
  if (
    STEPS_PAID.includes(v) &&
    (!this.transaction || !this.billing)
  )
    exception('Validation')
      .msg('transactionDetailsRequired')
      .throw();

  if (READY_FOR_DELIVERY === v && !this.shipping)
    exception('Validation')
      .msg('addressRequired')
      .throw();

  return true;
}

module.exports = {
  validateStatus,
};
