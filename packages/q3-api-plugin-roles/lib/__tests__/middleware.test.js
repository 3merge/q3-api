const Q3 = require('q3-api').default;
const {
  redact: redactMiddleware,
  permit,
} = require('../middleware');

const next = jest.fn();
const mockUser = {
  id: 1,
  role: 'dev',
};

const mockAccess = {
  can: jest.fn().mockResolvedValue({
    pickFrom: jest.fn(),
  }),
};

jest.mock('request-context');

afterEach(() => {
  next.mockReset();
});

describe('permit middleware', () => {
  let sess;

  beforeAll(() => {
    sess = permit('foo');
  });

  it('should bypass super users', async () => {
    await sess({ user: { role: 'Super' } }, {}, next);
    expect(next).toHaveBeenCalled();
  });

  it('should integrate with roles model', async () => {
    const req = { user: mockUser, method: 'PATCH' };
    jest.spyOn(Q3, 'model').mockReturnValue(mockAccess);
    await sess(req, {}, next);

    expect(next).toHaveBeenCalled();
    expect(mockAccess.can).toHaveBeenCalledWith(
      'Update',
      'foo',
      'dev',
    );
    expect(req.redact).toEqual(expect.any(Function));
  });
});

test('pickFromRequest middleware  should overwrite the body request', () => {
  const body = {
    foo: 'bar',
  };
  const redact = jest.fn().mockReturnValue({
    foo: 'baz',
  });

  redactMiddleware('request')({ body, redact }, {}, next);
  expect(redact).toHaveBeenCalled();
  expect(body).toMatchObject({ foo: 'baz' });
  expect(next).toHaveBeenCalled();
});
