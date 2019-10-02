const Q3 = require('q3-api').default;
const {
  setSession,
  pickFromRequest,
} = require('../middleware');

const next = jest.fn();
const mockUser = {
  id: 1,
  role: 'dev',
};

const canDo = jest.fn().mockReturnValue({
  pickFrom: jest.fn(),
});

const mockAccess = {
  can: jest.fn().mockReturnValue(canDo),
};

jest.mock('request-context');

afterEach(() => {
  next.mockReset();
});

describe('setSession middleware', () => {
  let sess;

  beforeAll(() => {
    sess = setSession('foo');
  });

  it('should throw an error without user context', () => {
    expect(sess({})).rejects.toThrowError();
  });

  it('should integrate with roles model', async () => {
    const req = { user: mockUser, method: 'PATCH' };
    jest.spyOn(Q3, 'model').mockReturnValue(mockAccess);
    await sess(req, {}, next);

    expect(next).toHaveBeenCalled();
    expect(mockAccess.can).toHaveBeenCalledWith('Update');
    expect(canDo).toHaveBeenCalledWith('dev', 'foo');
    expect(req.grants).toHaveProperty(
      'pickFrom',
      expect.any(Function),
    );
  });
});

test('pickFromRequest middleware  should overwrite the body request', () => {
  const body = {
    foo: 'bar',
  };
  const grants = {
    pickFrom: jest.fn().mockReturnValue({
      foo: 'baz',
    }),
  };

  pickFromRequest({ body, grants }, {}, next);
  expect(grants.pickFrom).toHaveBeenCalled();
  expect(body).toMatchObject({ foo: 'baz' });
  expect(next).toHaveBeenCalled();
});
