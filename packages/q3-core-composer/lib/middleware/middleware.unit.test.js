const middleware = require('.');

describe('Middleware', () => {
  it('should skip authentication without required UserModel methods', () => {
    expect(middleware).toThrowError();
  });
});
