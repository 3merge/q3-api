const nodemailer = require('nodemailer');

module.exports = async (strat, args) => {
  try {
    // eslint-disable-next-line
    const mod = require(`./${strat}`);
    const transporter = await mod(nodemailer);
    const info = await transporter.sendMail(args);

    if (process.env.NODE_ENV === 'test')
      // eslint-disable-next-line
    console.log(
        'Preview URL: %s',
        nodemailer.getTestMessageUrl(info),
      );
  } catch (err) {
    throw new Error('Unknown strategy');
  }
};
