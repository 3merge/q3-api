const { exception } = require('q3-core-responder');
const Bambora = require('./bambora');
const Schema = require('../schema');

const MERCHANTS = {
  Bambora,
};

const isApproved = (v) => Number(v) !== 0;

const verifyMerchantName = (v) => {
  if (!(v in MERCHANTS))
    exception('Conflict')
      .msg('unknownPaymentGatewayMerchant')
      .throw();
};

Schema.methods.pay = async function connectToGateway(
  merchant,
  token,
) {
  verifyMerchantName(merchant);

  const fn = MERCHANTS[merchant];
  const { approved, ...rest } = await fn(this, token);

  if (isApproved(approved)) {
    this.markModified('transactionReceipt');
    this.set('transactionReceipt', rest);
    this.set('status', 'Paid');
  } else {
    this.set('status', 'Declined');
  }

  return this.save();
};

module.exports = {
  isApproved,
  verifyMerchantName,
};
