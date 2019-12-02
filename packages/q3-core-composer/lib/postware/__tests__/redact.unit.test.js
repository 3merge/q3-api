const process = require('../redact');

describe.each([
  [['foo*', 'bar'], { foo: 1, foobar: 1, bar: 1 }],
  [
    ['foo*', '!foobar', 'ba*', '*.quux*'],
    {
      foo: 1,
      bar: 1,
      baz: {
        waldo: 1,
        plugh: 1,
        grault: {
          foo: 1,
          garply: { corge: 1 },
        },
      },
      waldo: { quux: 1 },
      qux: { quux: { xyzzy: 1 } },
    },
  ],
  [
    ['*.quux', '*.thud.qux'],
    {
      fred: { thud: { qux: 1 } },
      waldo: { quux: 1 },
    },
  ],
  [[], {}],
])('Pattern testing', (fields, expected) => {
  test(`"${fields}" matches expected`, () => {
    const doc = {
      body: {
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
      },
    };

    process(
      {
        redactions: {
          foo: {
            fields,
            locations: {
              request: ['body'],
            },
          },
        },
      },
      doc,
      'request',
    );

    expect(doc).toEqual({ body: expected });
  });
});

describe('Redact', () => {
  it('it should work with embedded arrays', () => {
    const resp = process(
      {
        redactions: {
          foo: {
            fields: ['name', 'friend.name'],
            locations: {
              request: ['body'],
            },
          },
        },
      },
      {
        body: {
          name: 'Jon',
          friend: {
            name: 'Jess',
            age: 1,
          },
        },
      },
      'request',
    );

    expect(resp).toEqual({
      body: {
        name: 'Jon',
        friend: {
          name: 'Jess',
        },
      },
    });
  });
});
