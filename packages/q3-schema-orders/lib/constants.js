const READY_FOR_DELIVERY = 'Ready for Delivery';

const STEPS_PREPAID = [
  'Quote',
  'Declined',
  'Open',
  'Under Review',
  'Backordered',
  'Cancelled',
  'Partially Completed without Balance',
  'On Hold',
];

const STEPS_PAID = [
  'Prepaid',
  'Paid',
  'Completed',
  'Refunded',
  'Partially Completed',
  READY_FOR_DELIVERY,
];

const CURRENCY = ['CAD', 'USD'];

module.exports = {
  STEPS_PAID,
  READY_FOR_DELIVERY,
  STEPS_PREPAID,
  STATUS_ENUM: [...STEPS_PREPAID, ...STEPS_PAID],
  CURRENCY,
};
