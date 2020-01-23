/* eslint-disable global-require, no-console, import/no-dynamic-require */
const nodemailer = require('nodemailer');

const forTestingPurposesOnly = async () => {
  const account = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
};

module.exports = async (strat, args) => {
  try {
    const transporter =
      process.env.NODE_ENV === 'test'
        ? await forTestingPurposesOnly()
        : await require(`./${strat}`)(nodemailer);

    const info = await transporter.sendMail(args);

    if (process.env.PREVIEW_EMAIL)
      console.log(
        'Preview URL: %s',
        nodemailer.getTestMessageUrl(info),
      );

    return info;
  } catch (err) {
    throw new Error('Unknown strategy');
  }
};
