/* eslint-disable global-require */
const ctx = require('request-context');
const middleware = require('../authorization');
const { model } = require('../../config/mongoose');

const httpHelper = middleware.__get__('convertHTTPtoOp');
const fetchPermission = middleware.__get__(
  'fetchPermission',
);

jest.mock('../../config/mongoose', () => ({
  model: () =>
    require('q3-test-utils/helpers/modelMock.js'),
}));

test('httpHelper should return method name', () => {
  expect(httpHelper('PUT')).toBe('Update');
  expect(httpHelper('POST')).toBe('Create');
  expect(() => httpHelper('Whoops')).toThrowError();
});

/*
describe('fetchPermission', () => {
  it('should bypass logic on `SUPER`', async () => {
    expect(
      await fetchPermission({
        role: 'Super',
      }),
    ).resolves.toMatchObject({
      fields: '*',
      ownership: 'Any',
    });
  });

  it('should query DB for grant', async () => {
    const doc = model();
    const args = {
      role: 'Bar',
      coll: 'Foo',
      op: 'Read',
    };
    await fetchPermission(args);
    expect(doc.findOne).toHaveBeenCalledWith(args);
  });
});
*/

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
