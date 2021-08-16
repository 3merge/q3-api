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

    const fn = IsAuthorized(model).inResponse('foo');

    const next = jest.fn();

    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith();

    expect(fn.locations.response).toEqual(['foo']);
  });

  it('should proceed on select dot notation', async () => {
    const model = 'Foo';
    const { req, res } = api;
    req.authorize = jest.fn().mockReturnValue({
      fields: ['*'],
    });

    const fn = IsAuthorized(model).inResponse('foo');

    const next = jest.fn();

    await fn.middleware(req, res, next);
    expect(req.authorize).toHaveBeenCalledWith(model);
    expect(next).toHaveBeenCalledWith();
    expect(fn.locations.response).toEqual(['foo']);
  });
});
