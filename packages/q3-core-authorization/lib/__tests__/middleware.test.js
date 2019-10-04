const { redact, verify } = require('../middleware');

describe('verify API', () => {
  it('should return a function', () => {
    expect(verify('foo')).toEqual(expect.any(Function));
  });

  it('should return chainable methods', () => {
    const chain = verify('foo');
    [chain.inRequest, chain.inResponse].forEach((i) => {
      expect(i).toEqual(expect.any(Function));
    });
  });

  it('should append to request object', () => {
    const chain = verify('foo');
    const req = {
      method: 'PATCH',
      user: { role: 'Developer' },
    };
    const next = jest.fn();
    chain(req, null, next);
    expect(next).toHaveBeenCalled();
    expect(req.authorization).toEqual({
      coll: 'foo',
      role: 'Developer',
      op: 'Update',
    });
  });

  it('should add target locations', () => {
    const chain = verify('foo')
      .inRequest('body')
      .inResponse('bar');
    const req = { method: 'DELETE' };
    const next = jest.fn();
    chain(req, null, next);
    expect(next).toHaveBeenCalled();
    expect(req.targets).toEqual({
      request: ['body'],
      response: ['bar'],
    });
  });
});

describe('redact', () => {
  it('should call DB', async () => {
    await redact(
      {
        authorization: {},
        user: {},
      },
      null,
      jest.fn,
    );
  });
});
