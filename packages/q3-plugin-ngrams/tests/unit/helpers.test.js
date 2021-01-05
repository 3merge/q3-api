const {
  between,
  castToDotNotation,
  chunk,
  clean,
  makeGram,
} = require('../../lib/helpers');

const context = castToDotNotation({
  foo: 1,
  bar: {
    quuz: 1,
  },
  thunk: [
    {
      garply: 1,
      waldo: [
        {
          xyzzy: 1,
        },
      ],
    },
    {
      garply: 1,
      waldo: [
        {
          xyzzy: 1,
        },
      ],
    },
  ],
});

describe.each([
  ['thano'],
  ['wind'],
  ['accessible'],
  ['professionals'],
  ['the'],
])('.chunk(%s)', (word) => {
  it('should split into chunks of 2 or 3', () =>
    expect(
      chunk(word).every((item) =>
        // less than 4 and more than 1
        between(item.length, 4, 1),
      ),
    ).toBeTruthy());
});

describe('clean', () => {
  it('should trim all items in the array', () => {
    expect(clean(' ~This. is a test! ')).toEqual(
      'thisisatest',
    );
  });
});

describe('"chunk"', () => {
  it('should return chunks with lengthiest variations', () => {
    expect(chunk('Eolande')).toEqual([
      'Eo',
      'lan',
      'de',
      'Eol',
      'and',
    ]);
  });
});

describe.each([
  ['foo', ['foo']],
  ['bar.quuz', ['bar.quuz']],
  ['thunk.garply', ['thunk.0.garply', 'thunk.1.garply']],
  [
    'thunk.waldo.xyzzy',
    ['thunk.0.waldo.0.xyzzy', 'thunk.1.waldo.0.xyzzy'],
  ],
])(
  '.castToDotNotation(document)(%s)',
  (path, expectedPath) => {
    it('should split into chunks of 2 or 3', () =>
      expect(context(path)).toEqual(expectedPath));
  },
);

describe.each([
  [undefined, []],
  [null, []],
  [true, []],
  [false, []],
  ['foo', ['fo', 'oo', 'foo']],
])('.makeGram(%s)', (term, expectedGrams) => {
  it('should make grams', () =>
    expect(makeGram(term)).toEqual(expectedGrams));
});
