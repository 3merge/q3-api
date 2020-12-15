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
      ...(doc.order_number
        ? { order_number: doc.order_number }
        : {}),
      name: doc.card_name
        ? doc.card_name
        : `${doc.billing.firstName} ${doc.billing.lastName}`,
      amount: doc.total,
      shipping,
      billing,
      token,
    },
    callback,
  );
};
