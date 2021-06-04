const jwt = require('jsonwebtoken');

module.exports = {
  async make() {
    const secret = crypto.randomBytes(20).toString('hex');
    const code = await jwt.sign(
      { secret },
      process.env.SECRET,
      { expiresIn: '24h' },
    );

    return {
      code,
      secret,
    };
  },

  async decrypt(secret, code) {
    const resp = await jwt.verify(code, process.env.SECRET);
    return resp.secret === code;
  },
};
