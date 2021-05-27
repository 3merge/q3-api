const { compose } = require('q3-core-composer');
const speakeasy = require('speakeasy');

const Verify2faController = async (
  { body: { secret, token } },
  res,
) => {
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });

  if (verified) {
    res.ok({
      token: '',
    });
  } else {
    res.ok({});
  }
};

Verify2faController.validation = [];

module.exports = compose(Verify2faController);
