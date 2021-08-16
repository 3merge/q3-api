const {
  clean,
  toJSON,
  merge,
  formatAsArray,
} = require('../formatters');

const d = new Date();
const fn = jest.fn();

test.each([
  [{ foo: 1, bar: undefined }, { foo: 1 }],
  [{ foo: d }, { foo: d }],
  [
    { foo: [{ bar: 1 }, { bar: undefined }] },
    { foo: [{ bar: 1 }, {}] },
  ],
])('.clean', (a, expected) => {
  expect(clean(a)).toEqual(expected);
});

test.each([
  [null, {}],
  [{ foo: 1 }, { foo: 1 }],
  [{ toJSON: jest.fn().mockReturnValue(1) }, 1],
])('.toJSON', (a, expected) => {
  expect(toJSON(a)).toEqual(expected);
});

test.each([
  [[fn], [fn]],
  [fn, [fn]],
  [undefined, []],
  [[null], []],
])('.formatAsArray', (a, expected) => {
  expect(formatAsArray(a)).toEqual(expected);
});

test.each([
  [
    { foo: 1, bar: 1 },
    { foo: 2, quuz: 1 },
    { foo: 2, bar: 1, quuz: 1 },
  ],
  [
    { sub: { foo: 1 } },
    { sub: { bar: 1 } },
    { sub: { foo: 1, bar: 1 } },
  ],
  [
    { sub: [{ foo: 1 }] },
    { sub: [{ bar: 1 }] },
    { sub: [{ foo: 1, bar: 1 }] },
  ],
  [{ sub: [1] }, { sub: [] }, { sub: [] }],
])('.merge', (a, b, expected) => {
  expect(merge(a, b)).toEqual(expected);
});
