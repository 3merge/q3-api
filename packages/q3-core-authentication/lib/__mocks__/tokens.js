module.exports.verifyToken = jest.fn();
module.exports.generateRandomSecret = jest
  .fn()
  .mockReturnValue('shh!');
module.exports.createHash = jest
  .fn()
  .mockReturnValue('hash!');
module.exports.compareWithHash = jest.fn();
