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
      fields: [
        {
          glob: 'items.bar',
          negate: true,
          test: 'items.quuz<2',
        },
      ],
    });

    const req = {
      authorize,
      fieldName: 'items',
      params: {
        fieldID: 1,
      },
      body: {
        foo: 1,
        bar: 1,
      },
    };

    middleware(req);

    expect(
      req.authorizeBody({
        items: [
          {
            _id: 1,
            foo: 1,
            bar: 1,
            quuz: 1,
          },
        ],
      }),
    ).toEqual({
      foo: 1,
    });
  });
});
