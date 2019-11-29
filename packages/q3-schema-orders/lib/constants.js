const INTERFACE_REQUIRED_METHODS = [
  'setItemBucket',
  'setItemUnmodifiedPrice',
  'setLocale',
  'setPayment',
  'setShipping',
  'setTax',
];

const INTERFACE_RECOMMENDED_METHODS = [
  'automateItemDiscounts',
  'automateRebates',
  'automateFees',
];

const MIDDLEWARE = [
  'isProductAvailable',
  'setProductContext',
  'addModifiers',
  'addToppers',
];

const READY_FOR_DELIVERY = 'Ready for Delivery';

const STEPS_PREPAID = [
  'Open',
  'Declined',
  'Processing',
  'Under Review',
  'Backordered',
  'Cancelled',
  'Partially Completed without Balance',
  'Authentication Required',
  'On Hold',
];

const STEPS_PAID = [
  'Paid',
  'Completed',
  'Refunded',
  'Partially Completed',
  READY_FOR_DELIVERY,
];

const BEST = 'lowest';
const COMPOUND = 'compound';
const ADD = 'accumulation';

const CURRENCY = ['CAD', 'USD'];

module.exports = {
  STEPS_PAID,
  READY_FOR_DELIVERY,
  STEPS_PREPAID,
  MIDDLEWARE,
  STATUS_ENUM: [...STEPS_PREPAID, ...STEPS_PAID],
  INTERFACE_REQUIRED_METHODS,
  INTERFACE_RECOMMENDED_METHODS,
  BEST,
  COMPOUND,
  ADD,
  CURRENCY,
};
