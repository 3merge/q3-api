const mailgun = require('mailgun-js');

module.exports = () => {
  const mg = mailgun({
    apiKey: process.env.MAILGUN_ACCESS_TOKEN,
    domain: process.env.MAILGUN_DOMAIN,
    testMode: process.env.MAILGUN_DEGUB,
  });

  return {
    send: (data) =>
      new Promise((resolve, reject) => {
        mg.messages().send(data, (error, body) => {
          if (error) reject(error);
          resolve(body);
        });
      }),
  };
};
