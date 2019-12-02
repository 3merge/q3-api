const { exception } = require('q3-core-responder');
const moment = require('moment');
const { get, round, multiply } = require('lodash');
const {
  READY_FOR_DELIVERY,
  STEPS_PAID,
} = require('../constants');

const asNum = (num) => (Number.isNaN(num) ? 0 : num);

const addUp = (...args) =>
  args.reduce((a, curr) => a + asNum(curr), 0);

const untilDone = async (g) => {
  const { done } = await g.next();
  return !done ? untilDone(g) : undefined;
};

const hasExpired = (context = {}) => {
  const {
    schema: { options },
    updatedAt,
  } =
    'parent' in context &&
    typeof context.parent === 'function'
      ? context.parent()
      : context;

  if (!options.validityInDays || !updatedAt) return true;
  const date = moment().add(options.validityInDays, 'd');
  return date.isBefore(updatedAt);
};

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
  this.items = get(this, 'items', []).reduce(
    (accumulator, current) => {
      const key = accumulator.findIndex((item) =>
        compareObjectIds(item.product, current.product),
      );

      if (key === -1) {
        accumulator.push(current);
      } else {
        accumulator[key].quantity += current.quantity;
      }

      return accumulator;
    },
    [],
  );
}

const convert = (
  num,
  inboundCurrency,
  outboundCurrency,
  rate,
) => {
  let sum = num;
  const equals = inboundCurrency === outboundCurrency;

  if (!equals && inboundCurrency === 'USD')
    sum = num * rate;
  if (!equals && inboundCurrency === 'CAD')
    sum = num / rate;

  return round(sum, 2);
};

const reducers = {
  fees(a, { quantity, value }) {
    return a + multiply(value, quantity);
  },

  lines(a, { subtotal }) {
    return a + subtotal;
  },

  rebates(items) {
    const lines = items.map((item) => ({
      sku: get(item, 'bucket.sku'),
      price: item.price,
      quantity: item.quantity,
      id: item.id,
      currency: item.currency,
    }));

    return (runningTotal, rebate) =>
      runningTotal +
      rebate
        .setRate(1.21)
        .reduceItems(lines)
        .sum();
  },
};

module.exports = {
  validateStatus,
  hasExpired,
  compareObjectIds,
  mergeDuplicateLineItems,
  untilDone,
  addUp,
  convert,
  reducers,
};
