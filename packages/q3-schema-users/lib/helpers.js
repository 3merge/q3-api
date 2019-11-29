const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const getSalts = () => parseInt(process.env.SALTS || 8, 10);

const generateRandomSecret = (byteSize = 20) =>
  crypto.randomBytes(byteSize).toString('hex');

const createHash = async (str) => {
  return bcrypt.hash(str, getSalts());
};

const compareWithHash = (a, b) => {
  return bcrypt.compareSync(a, b);
};

const generateIDToken = async (id, code, audience) => {
  if (!id)
    throw new Error('ID required to sign the jwt payload');

  const secret = process.env.SECRET;
  const nonce = generateRandomSecret(16);
  const token = await jwt.sign(
    { nonce, id, code },
    secret,
    { audience },
  );

  return {
    token,
    nonce,
  };
};

async function verifyToken(token, nonce, host) {
  try {
    const {
      id,
      aud,
      code,
      nonce: secretNonce,
    } = await jwt.verify(token, process.env.SECRET);

    const user = await this.findVerifiedById(id);

    if (
      nonce !== secretNonce ||
      aud !== host ||
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
  generateIDToken,
  verifyToken,
};
