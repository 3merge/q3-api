/* eslint-disable global-require, no-console, import/no-dynamic-require */
const nodemailer = require('nodemailer');

const forTestingPurposesOnly = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
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
    if (process.env.PREVIEW_EMAIL === true)
      console.log(
        'Preview URL: %s',
        nodemailer.getTestMessageUrl(info),
      );

    return info;
  } catch (err) {
    console.log(err);
    throw new Error('Unknown strategy');
  }
};
