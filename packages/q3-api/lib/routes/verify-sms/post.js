const { compose } = require('q3-core-composer');
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// @todo
// change this based on location
const from = process.env.TWILIO_PHONE_NUMBER;

const VerifySmsController = async (
  { body: { tel } },
  res,
) => {
  await client.messages.create({
    body: 'Your 3merge.ca verification code is: 441345',
    from,
    to: tel,
  });

  res.ok();
};

VerifySmsController.validation = [];

module.exports = compose(VerifySmsController);
