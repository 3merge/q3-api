const handler = require('../handlerDecorator');

describe('handlerDecorator', () => {
  it('should copy keys', () => {
    const fn = function testFn() {};
    fn.foo = 'bar';
    const out = handler(fn);
    expect(out).toHaveProperty('foo');
  });

  it('should run normally', async () => {
    const req = { marshal: jest.fn(), fieldName: 'foo' };
    const res = { say: jest.fn(), ok: jest.fn() };
    const fn = jest.fn().mockReturnValue({
      defaultResponseRouter: 'ok',
      message: 'test',
      data: {
        foo: 1,
      },
    });

    await handler(fn)(req, res);

    expect(res.ok).toHaveBeenCalled();
    expect(res.say).toHaveBeenCalledWith('test');
    expect(req.marshal).toHaveBeenCalledWith(1);
  });

  it('should acknowledge', async () => {
    const req = {
      query: { acknowledge: true },
    };

    const res = { acknowledge: jest.fn() };
    const fn = jest.fn().mockReturnValue({
      defaultResponseRouter: 'acknowledge',
      message: 'test',
      data: {
        foo: 1,
      },
    });

    await handler(fn)(req, res);
    expect(res.acknowledge).toHaveBeenCalled();
  });

  it('should return full receipt', async () => {
    const req = {
      marshal: jest.fn(),
      fieldName: 'foo',
      query: { fullReceipt: true },
    };

    const res = {
      acknowledge: jest.fn(),
      ok: jest.fn(),
    };

    const fn = jest.fn().mockReturnValue({
      defaultResponseRouter: 'acknowledge',
      message: 'test',
      data: {
        foo: 1,
      },
    });

    await handler(fn)(req, res);

    expect(res.ok).toHaveBeenCalled();
    expect(req.marshal).toHaveBeenCalledWith({
      foo: 1,
    });
  });
});
