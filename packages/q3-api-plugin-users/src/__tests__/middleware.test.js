import { verifyToken } from '../tokens';
import middleware, { enforceLogin } from '../middleware';

let req;

const res = {};
const next = jest.fn();

jest.mock('../tokens');
jest.mock('q3-api', () => ({
  __esModule: true,
  Errors: {
    AuthenticationError: Error,
  },
  default: {
    translate: jest.fn(),
    model: () => ({
      findByApiKey: jest.fn(),
    }),
  },
}));

beforeEach(() => {
  next.mockReset();
  req = { header: jest.fn(), get: jest.fn() };
});

describe('User token middleware', () => {
  it('should append user details to session', async () => {
    const decoded = { _id: 1 };
    verifyToken.mockResolvedValue(decoded);
    await middleware(req, res, next);
    expect(req.user).toMatchObject(decoded);
    expect(req.header).toHaveBeenCalled();
    expect(req.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('should check API key if token fails to decode', async () => {
    verifyToken.mockResolvedValue(null);
    await middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});

test('enforceLogin should error without user session', async () => {
  await enforceLogin(req, res, next);
  expect(next).toHaveBeenCalledWith(expect.any(Error));
});
