const formData = require('form-data');
const Mailgun = require('mailgun.js');

module.exports = (options = {}) => {
  const {
    debug = process.env.MAILGUN_DEBUG,
    domain = process.env.MAILGUN_DOMAIN,
    from = process.env.MAILER_FROM,
    key = process.env.MAILGUN_ACCESS_TOKEN,
  } = options;

  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    key,
    username: 'api',
  });

  return {
    send: (data = {}) => {
      if (String(debug) === 'true')
        Object.assign(data, {
          'o:testmode': 'yes',
        });

      if (!data.from && from)
        Object.assign(data, {
          from,
        });

      // now asyncronous
      return mg.messages.create(domain, data);
    },
  };
};
