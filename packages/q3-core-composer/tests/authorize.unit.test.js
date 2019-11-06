const {
  redact,
  authorizeRequest,
} = require('../lib/authorize');

const process = require('../lib/authorize').__get__(
  'process',
);

const FieldRedactionCommander = require('../lib/authorize').__get__(
  'FieldRedactionCommander',
);

let req;
const next = jest.fn();
const authorization = jest.fn().mockReturnValue({
  coll: 'foo',
  fields: '*, !bar',
});

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
    ['foo*', 'bar'],
    {
      foo: 1,
      foobar: 1,
      bar: 1,
    },
  ],
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
    ['*.quux', '*.thud.qux'],
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
    const inst = new FieldRedactionCommander('request', {});
    inst.fields = fields;
    expect(inst.$filter(doc)).toEqual(expected);
  });
});

beforeEach(() => {
  next.mockReset();
  req = {
    authorization,
  };
});

describe('verify API', () => {
  it('should return a function', () => {
    expect(redact('foo')).toEqual(expect.any(Function));
  });

  it('should return chainable methods', () => {
    const chain = redact('foo');
    [chain.inRequest, chain.inResponse].forEach((i) => {
      expect(i).toEqual(expect.any(Function));
    });
  });

  it('should append to request object', async () => {
    const chain = redact('foo');

    await chain(req, null, next);
    expect(next).toHaveBeenCalled();
    expect(req.redactions).toMatchObject({
      foo: {
        fields: ['*', '!bar'],
        locations: {
          request: [],
          response: [],
        },
      },
    });
  });

  it('should add target locations', async () => {
    const chain = redact('foo')
      .inRequest('body')
      .inResponse('bar');
    await chain(req, null, next);
    expect(next).toHaveBeenCalled();
    expect(req.redactions).toMatchObject({
      foo: {
        fields: ['*', '!bar'],
        locations: {
          request: ['body'],
          response: ['bar'],
        },
      },
    });
  });
});

describe('authorizeRequest', () => {
  it('should mutate the request body', async () => {
    const mutate = {
      body: {
        foo: 1,
        bar: 1,
        quux: 1,
      },
      redactions: {
        name: {
          fields: ['*', '!bar'],
          locations: {
            request: ['body'],
          },
        },
      },
    };

    await authorizeRequest(mutate, null, next);
    expect(next).toHaveBeenCalled();
    expect(mutate.body).toMatchObject({
      foo: 1,
      quux: 1,
    });
  });

  it('should prefix the mutation object', async () => {
    const mutate = {
      body: {
        quuz: 1,
        garply: 1,
      },
      redactions: {
        name: {
          fields: ['*', '!bar.quuz'],
          locations: {
            request: ['body'],
            prefix: 'bar',
          },
        },
      },
    };

    await authorizeRequest(mutate, null, next);
    expect(next).toHaveBeenCalled();
    expect(mutate.body).not.toHaveProperty('quuz');
    expect(mutate.body).toHaveProperty('garply');
  });
});

describe('Process generator', () => {
  it('it should redact ... Messy', async () => {
    const input = {
      foo: {
        garply: 1,
        quux: 1,
      },
      bar: {
        garply: 1,
        quux: 1,
      },
    };
    await process(
      {
        redactions: {
          foo: {
            locations: {
              request: ['foo', 'bar'],
            },
            fields: ['*', '!quux'],
          },
        },
      },
      input,
      'request',
    );

    expect(input).toEqual({
      foo: {
        garply: 1,
      },
      bar: {
        garply: 1,
      },
    });
  });
});
