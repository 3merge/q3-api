const {
  between,
  chunk,
  clean,
} = require('../../lib/helpers');

describe('clean', () => {
  it('should trim all items in the array', () => {
    expect(clean(' ~This. is a test! ')).toEqual(
      'thisisatest',
    );
  });
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
