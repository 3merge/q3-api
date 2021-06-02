const {
  clean,
  removeReservedKeys,
  toJSON,
} = require('../formatters');

const d = new Date();

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
  [{ foo: 1 }, { foo: 1 }],
  [{ foo: 1, updatedAt: 1 }, { foo: 1 }],
  [undefined, undefined],
])('.removeReservedKeys', (a, expected) => {
  removeReservedKeys(a);
  expect(a).toEqual(expected);
});

test.each([
  [null, {}],
  [{ foo: 1 }, { foo: 1 }],
  [{ toJSON: jest.fn().mockReturnValue(1) }, 1],
])('.toJSON', (a, expected) => {
  expect(toJSON(a)).toEqual(expected);
});
