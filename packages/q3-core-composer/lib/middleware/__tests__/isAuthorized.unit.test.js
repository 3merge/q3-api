const ApiMock = require('q3-test-utils/helpers/apiMock');
const IsAuthorized = require('../isAuthorized');

const api = new ApiMock();

beforeEach(() => {
  jest.resetAllMocks();
});

describe('IsAuthorized', () => {
  it('should run req.authorize and proceed', async () => {
    const model = 'Foo';
    const { req, res } = api;
    req.authorize = jest.fn().mockReturnValue({
      fields: ['*'],
    });

    const fn = IsAuthorized(model);
    const next = jest.fn();
    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith();
  });

  it('should run req.authorize and proceed', async () => {
    const model = 'Foo';
    const { req, res } = api;
    req.authorize = jest.fn().mockReturnValue({
      fields: ['*'],
    });

    const fn = IsAuthorized(model)
      .inResponse('foo')
      .requireField('bar');

    const next = jest.fn();

    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith();
    //  expect(fn.locations.request).toEqual(['query', 'body']);
    expect(fn.locations.response).toEqual(['foo']);
    expect(fn.locations.required).toBe('bar');
  });

  it('should proceed on select dot notation', async () => {
    const model = 'Foo';
    const { req, res } = api;
    req.authorize = jest.fn().mockReturnValue({
      fields: ['*'],
    });

    const fn = IsAuthorized(model)
      .inResponse('foo')
      .requireField('bar');

    const next = jest.fn();

    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith();
    expect(fn.locations.response).toEqual(['foo']);
    expect(fn.locations.required).toBe('bar');
  });

  test.each([
    ['*', ['foo', 'bar'], {}, true],
    [['!quuz'], ['foo', 'bar'], {}, true],
    [['!foo'], ['foo', 'bar'], {}, false],
    [
      [{ glob: 'quuz', negate: true, test: ['foo=1'] }],
      ['foo', 'bar'],
      {},
      true,
    ],
    [
      [{ glob: 'foo', negate: true, test: ['quuz=1'] }],
      ['foo', 'bar'],
      { foo: 1, bar: 1, quuz: 1 },
      false,
    ],
  ])(
    '.meetsFieldRequirements()',
    (fields, required, body, expected) => {
      const out = IsAuthorized(
        'Test',
      ).meetsFieldRequirements.call(
        {
          locations: {
            required,
          },
        },
        fields,
        body,
      );

      expect(out).toBe(expected);
    },
  );
});
