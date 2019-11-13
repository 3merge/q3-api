const ctx = require('request-context');
const {
  exception,
  handleUncaughtExceptions,
} = require('../exception');

beforeAll(() => {
  ctx.middleware('jest');
});

describe('Exception chain', () => {
  it('should return a decorated error', () => {
    const err = exception('Authorization')
      .msg('fail')
      .boomerang();

    expect(err.name).toBe('Authorization');
    expect(err.message).toBe('errors:fail');
    expect(err.statusCode).toBe(403);
  });

  it('should report all error paths', () => {
    const err = exception('Unknown')
      .field({
        name: ['foo', 'bar'],
        msg: 'baaz',
        value: 1,
      })
      .field({
        name: 'quuz',
        value: 2,
      })
      .boomerang();

    expect(err.name).toBe('InternalServer');
    expect(err.statusCode).toBe(500);
    expect(err.errors).toMatchObject({
      foo: {
        msg: 'validations:baaz',
        value: 1,
      },
      bar: {
        msg: 'validations:baaz',
        value: 1,
      },
      quuz: {
        msg: 'validations:quuz',
        value: 2,
      },
    });
  });
});

describe('handleUncaughtExceptions', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockImplementation(() => res),
      json: jest.fn().mockImplementation(() => res),
    };
  });

  it('should set the status', () => {
    handleUncaughtExceptions(
      exception('BadRequest').boomerang(),
      {},
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should not set the status', () => {
    handleUncaughtExceptions(
      new Error(),
      {},
      { ...res, headersSent: true },
      jest.fn(),
    );

    expect(res.status).not.toHaveBeenCalled();
  });

  it('should correct 500 response if error payload present', () => {
    handleUncaughtExceptions(
      exception('Unknown')
        .field('hey')
        .boomerang(),
      { t: jest.fn() },
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(422);
  });
});
