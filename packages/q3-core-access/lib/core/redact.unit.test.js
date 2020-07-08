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
  Grant.prototype.test = jest.fn().mockReturnValue({
    fields,
  });
});

describe('redact', () => {
  it('should remove nested properties', async () => {
    const { bar } = await redact(shape);
    expectRedactions(bar);
  });

  it('should execute on arrays', async () => {
    const [{ bar }] = await redact([shape]);
    expectRedactions(bar);
  });
});
