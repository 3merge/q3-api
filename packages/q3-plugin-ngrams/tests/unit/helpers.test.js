const {
  between,
  castToDotNotation,
  chunk,
  clean,
  makeGram,
} = require('../../lib/helpers');
const {
  MAX_GRAM_SIZE,
  MIN_GRAM_SIZE,
} = require('../../lib/constants');

const includesEach = (a, b) =>
  b.every((item) => a.includes(item));

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
  it('should split into chunks by constant length', () =>
    expect(
      chunk(word).every((item) =>
        between(
          item.length,
          MAX_GRAM_SIZE + 1,
          MIN_GRAM_SIZE - 1,
        ),
      ),
    ).toBeTruthy());
});

describe('clean', () => {
  it('should trim all items in the array', () => {
    expect(clean(' ~This. is a test! ')).toEqual(
      'thisisatest',
    );
  });

  it('should remove all html', () => {
    expect(
      clean(
        `<div><p style="color:red">Nope! This is clean! </p>
        <br>
        <img alt="testing" />
        <p>Jan 2023</p></div>`,
      ),
    ).toEqual('nopethisiscleanjan2023');
  });
});

describe.each([
  ['Eolande', ['Eolande']],
  ['PVX9000123', ['PVX90', '00123']],
  ['AA900121', ['AA90', '0121']],
  ['1HELLOWORLD2020', ['1HELL', 'OWORL', 'D2020']],
])('.chunk(%s)', (term, expectedValue) => {
  it('should not make grams', () =>
    expect(chunk(term)).toEqual(expectedValue));
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
])('.makeGram(%s)', (term, expectedGrams) => {
  it('should not make grams', () =>
    expect(makeGram(term)).toEqual(expectedGrams));
});

describe.each([
  [
    'foo bar',
    ['f', 'fo', 'foo', 'foob', 'fooba', 'b'],
    ['a', 'foobar'],
  ],
])(
  '.makeGram(%s)',
  (term, expectedGrams, excludedGrams) => {
    it('should include/exclude grams', () => {
      const g = makeGram(term);
      expect(includesEach(g, expectedGrams)).toBeTruthy();
      expect(includesEach(g, excludedGrams)).toBeFalsy();
    });
  },
);
