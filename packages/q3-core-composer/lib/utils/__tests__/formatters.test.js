const {
  clean,
  pickByTargetObject,
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
  [{ foo: 1, bar: 1 }, { foo: 1 }, {}, { foo: 1 }],
  [
    { foo: undefined, bar: 1 },
    { foo: 1 },
    { clean: true },
    {},
  ],
  [
    { foo: 1, bar: { baz: 1 } },
    { bar: 1 },
    { select: 'bar' },
    {
      baz: 1,
    },
  ],
])('.pickByTargetObject', (a, b, options, expected) => {
  expect(pickByTargetObject(a, b, options)).toEqual(
    expected,
  );
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
