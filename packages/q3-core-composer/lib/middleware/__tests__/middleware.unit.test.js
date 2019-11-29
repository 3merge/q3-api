/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');
const middleware = require('..');

const findbyBearerToken = jest.fn();
const findByApiKey = jest.fn();
const getPermission = jest.fn();
const next = jest.fn();

const req = {
  method: 'GET',
  get: jest.fn().mockReturnValue('Bearer 123'),
  header: jest.fn(),
};

class Decorators {
  static findbyBearerToken(a) {
    return findbyBearerToken(a);
  }

  static findByApiKey(a) {
    return findByApiKey(a);
  }

  static hasGrant(a, b, c) {
    return getPermission(a, b, c);
  }
}

const Schema = new mongoose.Schema({});
const NakedModel = mongoose.model('Naked', Schema);

Schema.loadClass(Decorators);
const DecoratoratedModel = mongoose.model(
  'Decorated',
  Schema,
);

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Middleware', () => {
  it('should error without models', () => {
    expect(middleware).toThrowError();
  });

  it('should skip authentication without required UserModel methods', async () => {
    const fn = middleware(NakedModel, NakedModel);
    await fn(req, {}, next);
    expect(next).toHaveBeenCalled();
    expect(req.authorize).toBeDefined();
  });

  it('should call both decorators', async () => {
    const fn = middleware(DecoratoratedModel, NakedModel);
    await fn(req, {}, next);
    expect(findbyBearerToken).toHaveBeenCalledWith('123');
    expect(findByApiKey).toHaveBeenCalledWith('123');
  });

  it('should translate the method and user role type', async () => {
    findByApiKey.mockResolvedValue({
      _id: 123,
    });

    const fn = middleware(
      DecoratoratedModel,
      DecoratoratedModel,
    );
    await fn(req, {}, next);
    await req.authorize('Foo');
    expect(getPermission).toHaveBeenCalledWith(
      'Foo',
      'Read',
      { _id: 123 },
    );
  });
});
