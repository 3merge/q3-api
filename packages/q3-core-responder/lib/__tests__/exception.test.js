const {
  exception,
  handleUncaughtExceptions,
} = require('../exception');

describe('Exception chain', () => {
  it('should return a decorated error', () => {
    const err = exception('Authorization')
      .msg('fail')
      .boomerang();

    expect(err.name).toBe('Authorization');
    expect(err.message).toBe('fail');
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
        msg: 'baaz',
        value: 1,
      },
      bar: {
        msg: 'baaz',
        value: 1,
      },
      quuz: {
        msg: 'quuz',
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

  it('should extract error messages', () => {
    const e = new Error();

    e.errors = {
      foo: 'bar',
      bar: {
        msg: 'baz',
      },
      baz: {
        properties: {
          message: 'thunk',
        },
      },
    };

    const expectMsg = (msg) =>
      expect.objectContaining({
        msg,
      });

    const t = jest.fn().mockImplementation((v) => {
      const [namespace, prop] = v.split(':');
      expect(namespace).toMatch(/(validations|messages)/);

      return prop;
    });

    handleUncaughtExceptions(e, { t }, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'validation',
        errors: {
          foo: expectMsg('bar'),
          bar: expectMsg('baz'),
          baz: expectMsg('thunk'),
        },
      }),
    );
  });

  it('should correct 500 response if error payload present', () => {
    handleUncaughtExceptions(
      exception('Unknown').field('hey').boomerang(),
      { t: jest.fn() },
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(422);
  });
});
