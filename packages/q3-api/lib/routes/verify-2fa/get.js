const { compose } = require('q3-core-composer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateQrCode = (xs) =>
  new Promise((res, rej) => {
    QRCode.toDataURL(xs, (err, uri) => {
      if (err) rej(err);
      else res(uri);
    });
  });

const Verify2faController = async (req, res) => {
  const secret = speakeasy.generateSecret();
  const qr = await generateQrCode(secret.otpauth_url);

  console.log(secret.base32);
  // SETUP...

  res.ok({
    qr,
  });
};

Verify2faController.validation = [];

module.exports = compose(Verify2faController);
