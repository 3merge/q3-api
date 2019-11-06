const mg = require('nodemailer-mailgun-transport');

module.exports = async (n) =>
  n.createTransport(
    mg({
      auth: {
        api_key: process.env.MAILGUN_ACCESS_TOKEN,
        domain: process.env.MAILGUN_DOMAIN,
      },
    }),
  );
