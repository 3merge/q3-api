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
      // allow us to alias any property to map to underlying API spec
      ...(doc.order_number
        ? { order_number: doc.order_number }
        : {}),
      amount: doc.total,
      name: `${doc.billing.firstName} ${doc.billing.lastName}`,
      shipping,
      billing,
      token,
    },
    callback,
  );
};
