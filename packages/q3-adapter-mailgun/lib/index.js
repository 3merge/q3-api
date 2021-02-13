const mailgun = require('mailgun-js');

module.exports = () => {
  const mg = mailgun({
    apiKey: process.env.MAILGUN_ACCESS_TOKEN,
    domain: process.env.MAILGUN_DOMAIN,
    testMode: process.env.MAILGUN_DEBUG,
  });

  return {
    send: ({ variables, ...data }) =>
      new Promise((resolve, reject) => {
        mg.messages().send(
          {
            ...data,
            'h:X-Mailgun-Variables': JSON.stringify(
              variables,
            ),
          },
          (error, body) => {
            if (error) reject(error);
            resolve(body);
          },
        );
      }),
  };
};
