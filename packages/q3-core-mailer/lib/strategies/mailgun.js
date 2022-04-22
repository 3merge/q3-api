const formData = require('form-data');
const Mailgun = require('mailgun.js');

module.exports = () => {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    key: process.env.MAILGUN_ACCESS_TOKEN,
    username: 'api',
  });

  return {
    send: (data = {}) => {
      if (String(process.env.MAILGUN_DEBUG) === 'true')
        Object.assign(data, {
          'o:testmode': 'yes',
        });

      // now asyncronous
      return mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        data,
      );
    },
  };
};
