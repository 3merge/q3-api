const middleware = require('../authorizeBody');

describe('authorizeBody', () => {
  it('should run without context', () => {
    const authorize = jest.fn().mockReturnValue({
      fields: ['foo'],
    });

    const req = {
      authorize,
      collectionName: 'test',
      body: {
        foo: 1,
        bar: 1,
      },
    };

    middleware(req);

    expect(req.authorizeBody()).toEqual({
      foo: 1,
    });

    expect(authorize).toHaveBeenCalledWith('test');
  });

  it('should run with context', () => {
    const authorize = jest.fn().mockReturnValue({
      fields: [
        {
          glob: 'foo',
          test: ['bar>2'],
        },
      ],
    });

    const req = {
      authorize,
      body: {
        foo: 1,
      },
    };

    middleware(req);

    expect(
      req.authorizeBody(
        {
          bar: 3,
        },
        'test',
      ),
    ).toEqual({
      foo: 1,
    });

    expect(authorize).toHaveBeenCalledWith('test');
  });

  it('should wind and unwind body', () => {
    const authorize = jest.fn().mockReturnValue({
      fields: ['!sub.bar'],
    });

    const req = {
      authorize,
      fieldName: 'sub',
      body: {
        foo: 1,
        bar: 1,
      },
    };

    middleware(req);

    expect(
      req.authorizeBody({
        quuz: 1,
      }),
    ).toEqual({
      foo: 1,
    });
  });
});
