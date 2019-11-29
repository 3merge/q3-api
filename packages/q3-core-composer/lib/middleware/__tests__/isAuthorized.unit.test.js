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
    req.authorize = jest.fn().mockResolvedValue({
      fields: '*',
    });

    const fn = IsAuthorized(model);
    const next = jest.fn();
    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith(undefined);
  });

  it('should run req.authorize and proceed', async () => {
    const model = 'Foo';
    const { req, res } = api;
    req.authorize = jest.fn().mockResolvedValue({
      fields: '*',
    });

    const fn = IsAuthorized(model)
      .inResponse('foo')
      .inRequest('query')
      .inRequest('body')
      .requireField('bar');

    const next = jest.fn();

    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith(undefined);
    expect(fn.locations.request).toEqual(['query', 'body']);
    expect(fn.locations.response).toEqual(['foo']);
    expect(fn.locations.required).toBe('bar');
  });
});
