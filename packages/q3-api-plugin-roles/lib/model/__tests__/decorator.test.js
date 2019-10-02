const Decorator = require('../decorator');

const inst = new Decorator();

const doc = {
  foo: 1,
  foobar: 1,
  fred: {
    plugh: 1,
    thud: {
      qux: 1,
    },
  },
  bar: 1,
  baz: {
    waldo: 1,
    plugh: 1,
    grault: {
      foo: 1,
      garply: {
        corge: 1,
      },
    },
  },
  garply: 1,
  waldo: {
    quux: 1,
  },
  qux: {
    quux: {
      xyzzy: 1,
    },
  },
};

describe.each([
  [
    'foo*, bar',
    {
      foo: 1,
      foobar: 1,
      bar: 1,
    },
  ],
  [
    'foo*, !foobar, ba*, *.quux*',
    {
      foo: 1,
      bar: 1,
      baz: {
        waldo: 1,
        plugh: 1,
        grault: {
          foo: 1,
          garply: {
            corge: 1,
          },
        },
      },
      waldo: {
        quux: 1,
      },
      qux: {
        quux: {
          xyzzy: 1,
        },
      },
    },
  ],
  [
    '*.quux, *.thud.qux',
    {
      fred: {
        thud: {
          qux: 1,
        },
      },
      waldo: {
        quux: 1,
      },
    },
  ],
  [undefined, {}],
])('Pattern testing', (fields, expected) => {
  test(`"${fields}" matches expected`, () => {
    expect(inst.pickFrom.call({ fields }, doc)).toEqual(
      expected,
    );
  });
});

describe('static can', () => {
  it('should throw', () => {
    expect(() => Decorator.can('INSERT')).toThrowError();
  });

  it('should throw without global mongoose methods', () => {
    const findOne = jest.fn().mockResolvedValue({});
    const canDo = Decorator.can.call({ findOne }, 'Read');
    expect(canDo('Foo')).rejects.toThrow();
  });

  it('should use default role argument', async () => {
    const findOne = jest.fn().mockResolvedValue({
      hasSufficientOwnership: jest
        .fn()
        .mockReturnValue(true),
    });
    const canDo = Decorator.can.call({ findOne }, 'Update');
    await canDo('Foo');
    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        role: { $exists: false },
        op: 'Update',
        coll: 'Foo',
      }),
    );
  });

  it('should return full permissoins', () => {
    const canDo = Decorator.can.call({}, 'Create');
    expect(canDo('Foo', 'Super')).resolves.toMatchObject({
      fields: '*',
    });
  });
});
