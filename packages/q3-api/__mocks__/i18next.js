module.exports = {
  t: jest.fn().mockReturnValue('foo'),
  use() {
    return {
      init: jest.fn(),
    };
  },
};
