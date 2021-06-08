const { request, response } = require('..');

jest.mock('q3-core-session', () => ({
  kill: jest.fn(),
}));

jest.mock('express-mung', () => ({
  jsonAsync: jest.fn().mockImplementation((fn) => fn),
}));

describe('postware', () => {
  it('should redact from the response', async () => {
    const req = {
      redactions: {
        test: {
          locations: {
            response: ['test'],
          },
          grant: {
            op: 'Update',
            fields: ['foo'],
          },
        },
      },
    };

    const out = await response(
      {
        test: {
          foo: 1,
          bar: 1,
        },
      },
      req,
    );

    expect(out).toEqual({
      test: {
        foo: 1,
      },
    });
  });

  it('should re-run on body', async () => {
    const next = jest.fn();

    const req = {
      body: {
        updatedAt: new Date(),
        foo: 1,
        bar: 1,
      },
      redactions: {
        test: {
          locations: {
            request: ['body'],
          },
          grant: {
            op: 'Update',
            fields: [
              'foo',
              {
                glob: 'bar',
                test: ['quuz=1'],
              },
            ],
          },
        },
      },
    };

    await request(req, {}, next);
    expect(req.body).toHaveProperty('foo');
    expect(req.body).toHaveProperty('bar');
    expect(req.body).not.toHaveProperty('updatedAt');

    await req.rerunRedactOnRequestBody({
      quuz: 4,
    });

    expect(req.body).not.toHaveProperty('bar');
  });

  it('should move on without redaction commands', async () => {
    const next = jest.fn();
    const req = {};

    await request(req, {}, next);
    expect(next).toHaveBeenCalled();
    expect(req.rerunRedactOnRequestBody).toEqual(
      expect.any(Function),
    );
  });
});
