const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

module.exports = {
  async make() {
    const { base32: secret, otpauth_url: url } =
      speakeasy.generateSecret();

    const code = await Promise((res, rej) =>
      QRCode.toDataURL(url, (err, uri) => {
        if (err) rej(err);
        else res(uri);
      }),
    );

    return {
      secret,
      code,
    };
  },

  decrypt(secret, code) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });
  },
};
