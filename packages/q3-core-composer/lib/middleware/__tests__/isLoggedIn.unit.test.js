const IsLoggedIn = require('../isLoggedIn');

describe('IsLoggedIn', () => {
  it('should move onto next function', () => {
    const next = jest.fn();
    IsLoggedIn({ user: { _id: 1 } }, null, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 status', () => {
    const res = {
      status: jest.fn().mockImplementation(() => ({
        send: jest.fn(),
      })),
    };
    IsLoggedIn({ user: null }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
