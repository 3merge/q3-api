const ctx = require('request-context');
const {
  verifyToken,
} = require('../../models/user/helpers');
const { model } = require('../../config/mongoose');
const middleware = require('../authentication');

let req;

const res = {};
const next = jest.fn();

jest.mock('../../models/user/helpers');
jest.mock('../../config/mongoose', () => ({
  model: jest.fn().mockReturnValue({
    findByApiKey: jest.fn(),
  }),
}));

beforeEach(() => {
  next.mockReset();
  req = { header: jest.fn(), get: jest.fn() };
});

describe('authentication', () => {
  beforeAll(() => {
    jest.spyOn(ctx, 'set');
  });

  it('should append user details to session', async () => {
    const decoded = { _id: 1 };
    verifyToken.mockResolvedValue(decoded);
    await middleware(req, res, next);
    expect(model).toHaveBeenCalled();
    expect(req.user).toMatchObject(decoded);
    expect(req.header).toHaveBeenCalled();
    expect(req.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should check API key if token fails to decode', async () => {
    const doc = model();
    verifyToken.mockResolvedValue(null);
    await middleware(req, res, next);
    expect(doc.findByApiKey).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
