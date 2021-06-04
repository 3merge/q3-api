module.exports = {
  make() {
    const code = Math.floor(
      100000 + Math.random() * 900000,
    );

    return {
      code,
      secret: code,
    };
  },

  decrypt(secret, code) {
    return secret === code;
  },
};
