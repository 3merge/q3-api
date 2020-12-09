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

const getTraceDetails = (transactionReceipt) => {
  if (
    !transactionReceipt.trace ||
    !transactionReceipt.trace.response
  )
    return transactionReceipt;

  const {
    status,
    statusText,
    data,
  } = transactionReceipt.trace.response;
  return {
    ...data,
    statusText,
    status,
  };
};

const getStatus = (transactionReceipt) =>
  isApproved(transactionReceipt.approved)
    ? 'Paid'
    : 'Declined';

Schema.methods.pay = async function connectToGateway(
  merchant,
  token,
  callback,
) {
  verifyMerchantName(merchant);
  const fn = MERCHANTS[merchant];
  const resp = await fn(this, token, callback);

  this.set({
    status: getStatus(resp),
    transactionReceipt: getTraceDetails(resp),
  });

  // need to do this for Mixed schema types
  this.markModified('transactionReceipt');
  return this.save();
};

module.exports = {
  isApproved,
  verifyMerchantName,
};
