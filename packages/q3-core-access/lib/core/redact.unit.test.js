const AccessControl = require('./accessControl');
const Grant = require('./grant');
const redact = require('./redact');

const shape = {
  foo: 1,
  bar: [
    {
      quuz: 1,
      thunk: 1,
    },
  ],
};

const fields = ['foo', 'bar.*.quuz'];

const expectRedactions = (bar) => {
  expect(bar[0]).toHaveProperty('quuz');
  expect(bar[0]).not.toHaveProperty('thunk');
};

beforeAll(() => {
  AccessControl.init([{ coll: 'foo' }]);
});

describe('redact', () => {
  beforeAll(() => {
    Grant.prototype.test = jest.fn().mockReturnValue({
      fields,
    });
  });

  it('should remove nested properties', async () => {
    const { bar } = await redact(shape);
    expectRedactions(bar);
  });

  it('should execute on arrays', async () => {
    const [{ bar }] = await redact([shape]);
    expectRedactions(bar);
  });
});

test('should convert field rules', () => {
  Grant.prototype.test = jest.fn().mockReturnValue({
    fields: [
      {
        glob: 'bar',
        negate: true,
        wildcard: true,
        test: ['foo=1'],
      },
    ],
  });

  return expect(
    redact({
      foo: 1,
      bar: 1,
    }),
  ).resolves.not.toHaveProperty('bar');
});

test('should prioritize negations', async () => {
  Grant.prototype.test = jest.fn().mockReturnValue({
    fields: ['!foo', '{foo,bar}', '!bar'],
  });

  return expect(
    redact({
      foo: 1,
      bar: 1,
      thunk: 6,
    }),
  ).resolves.toEqual({});
});

test('should add to the list of inclusions', async () => {
  Grant.prototype.test = jest.fn().mockReturnValue({
    fields: [
      'foo',
      {
        glob: 'bar',
        test: ['thunk>5'],
      },
    ],
  });

  return expect(
    redact({
      foo: 1,
      bar: 1,
      thunk: 6,
    }),
  ).resolves.toEqual({
    foo: 1,
    bar: 1,
  });
});

test('should default to no access', async () => {
  Grant.prototype.test = jest.fn().mockReturnValue({
    fields: [
      {
        glob: 'foo',
        test: ['bar=*'],
      },
    ],
  });

  return expect(
    redact({
      foo: 1,
    }),
  ).resolves.toEqual({});
});
