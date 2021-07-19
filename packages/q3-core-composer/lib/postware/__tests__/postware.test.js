jest.mock('q3-core-session', () => ({
  kill: jest.fn(),
}));

jest.mock('q3-core-access', () => ({
  Redact: jest.fn().mockResolvedValue({
    foo: 1,
  }),
}));

jest.mock('express-mung', () => ({
  jsonAsync: jest.fn().mockImplementation((fn) => fn),
}));

const { Redact } = require('q3-core-access');
const response = require('..');

const makeBodyPayload = (xs) => ({
  test: { foo: 1, bar: 1, ...xs },
});

const makeRequest = (xs = {}, prefix) => ({
  redactions: [
    {
      collectionName: 'test',
      locations: {
        response: ['test'],
        prefix,
      },
    },
  ],
  user: {},
  ...xs,
});

describe('postware', () => {
  it('should output Redact result', () => {
    const b = makeBodyPayload();
    expect(response(b, makeRequest())).resolves.toEqual({
      test: {
        foo: 1,
      },
    });

    expect(Redact).toHaveBeenCalledWith(
      b.test,
      expect.any(Object),
      expect.any(String),
    );
  });

  it('should output nested Redact result', () => {
    const b = makeBodyPayload();

    expect(
      response(b, makeRequest({}, 'thunk')),
    ).resolves.toEqual({
      test: {
        foo: 1,
      },
    });

    expect(Redact).toHaveBeenCalledWith(
      { thunk: b.test },
      expect.any(Object),
      expect.any(String),
    );
  });

  it('should consider locals in redaction', async () => {
    await response(
      makeBodyPayload(),
      makeRequest({
        locals: {
          fullParentDocument: {
            quuz: 1,
          },
        },
      }),
    );

    expect(Redact).toHaveBeenCalledWith(
      {
        quuz: 1,
        foo: 1,
        bar: 1,
      },
      expect.any(Object),
      expect.any(String),
    );
  });

  it('should map locals in redaction', async () => {
    await response(
      {
        test: [
          {
            foo: 1,
            bar: 1,
          },
        ],
      },
      makeRequest({
        locals: {
          fullParentDocument: {
            quuz: 1,
          },
        },
      }),
    );

    expect(Redact).toHaveBeenCalledWith(
      [
        {
          quuz: 1,
          foo: 1,
          bar: 1,
        },
      ],
      expect.any(Object),
      expect.any(String),
    );
  });
});
