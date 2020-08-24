const Bambora = require('bambora-node');

module.exports = (doc, token, callback) => {
  const client = new Bambora(process.env.BAMBORA_API_KEY);
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
