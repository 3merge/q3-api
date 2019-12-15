const { exception } = require('q3-core-responder');
const {
  READY_FOR_DELIVERY,
  STEPS_PAID,
} = require('./constants');

const compareObjectIds = (a, b) =>
  typeof a === 'object' && 'equals' in a
    ? a.equals(b)
    : a === b;

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

function mergeDuplicateLineItems() {
  const { items = [] } = this;
  this.items = items.reduce((accumulator, current) => {
    const key = accumulator.findIndex((item) =>
      compareObjectIds(item.product, current.product),
    );

    if (key === -1) {
      accumulator.push(current);
    } else {
      accumulator[key].quantity += current.quantity;
    }

    return accumulator;
  }, []);
}

module.exports = {
  validateStatus,
  mergeDuplicateLineItems,
};
