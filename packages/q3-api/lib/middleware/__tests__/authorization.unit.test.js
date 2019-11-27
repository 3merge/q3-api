const ctx = require('request-context');
const middleware = require('../authorization');
const { model } = require('../../config/mongoose');

const httpHelper = middleware.__get__('convertHTTPtoOp');
const fetchPermission = middleware.__get__(
  'fetchPermission',
);

jest.mock('../../config/mongoose', () => ({
  model: jest.fn().mockReturnValue({
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          isValid: jest.fn(),
        }),
      }),
    }),
  }),
}));

test('httpHelper should return method name', () => {
  expect(httpHelper('PUT')).toBe('Update');
  expect(httpHelper('POST')).toBe('Create');
  expect(() => httpHelper('Whoops')).toThrowError();
});

describe('fetchPermission', () => {
  it('should bypass logic on `SUPER`', () => {
    expect(
      fetchPermission({
        role: 'Super',
      }),
    ).resolves.toMatchObject({
      fields: '*',
      ownership: 'Any',
    });
  });

  it('should query DB for grant', () => {
    const doc = model();
    const args = {
      role: 'Bar',
      coll: 'Foo',
      op: 'Read',
    };
    fetchPermission(args);
    expect(doc.findOne).toHaveBeenCalledWith(args);
  });
});

describe('middleware', () => {
  it('should set context', async () => {
    const req = {
      method: 'PATCH',
      user: {
        role: 'Super',
      },
    };

    middleware(req, {}, jest.fn());
    expect(req).toHaveProperty('authorization');
    await req.authorization('FOO');
    expect(ctx.set.mock.calls).toHaveLength(1);
  });
});
