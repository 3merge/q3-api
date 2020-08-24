const Bambora = require('bambora-node');

module.exports = (doc, token, callback) => {
  const client = new Bambora(
    process.env.PAYMENT_GATEWAY_KEY,
    process.env.PAYMENT_GATEWAY_SKIP_PREAUTH,
  );

  const shipping = doc.shipping.normalize().bambora();
  const billing = doc.billing.normalize().bambora();

  return client.postPayment(
    {
      amount: doc.total,
      name: `${doc.billing.firstName} ${doc.billing.lastName}`,
      shipping,
      billing,
      token,
    },
    callback,
  );
};
