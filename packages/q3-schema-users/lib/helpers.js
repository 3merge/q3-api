const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const getSalts = () => parseInt(process.env.SALTS || 8, 10);

const generateRandomSecret = (byteSize = 20) =>
  crypto.randomBytes(byteSize).toString('hex');

const createHash = async (str) =>
  bcrypt.hash(str, getSalts());

const compareWithHash = (a, b) => bcrypt.compareSync(a, b);

const stripPortFromString = (address) => {
  try {
    return address.split(':')[0];
  } catch (e) {
    return address;
  }
};

async function verifyToken(token, nonce, host) {
  try {
    const {
      id,
      aud,
      code,
      nonce: secretNonce,
    } = await jwt.verify(token, process.env.SECRET);

    const user = await this.findById(id);

    if (
      nonce !== secretNonce ||
      stripPortFromString(aud) !==
        stripPortFromString(host) ||
      !user.isPermitted ||
      user.secret !== code
    )
      throw new Error(
        'Invalid token context or user state',
      );

    return user;
  } catch (err) {
    // log it?
    return null;
  }
}

module.exports = {
  generateRandomSecret,
  createHash,
  compareWithHash,
  verifyToken,
};
