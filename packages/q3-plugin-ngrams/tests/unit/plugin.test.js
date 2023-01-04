const plugin = require('../../lib/plugin');

const expectSearchToEqual = (str, expectedArray) =>
  expect(plugin.getSearch(str).ngrams.$all).toEqual(
    expectedArray,
  );

describe('plugin', () => {
  it('should breakdown into longest forms', () => {
    expectSearchToEqual('beta-testers', [
      'betate',
      'sters',
      'betates',
    ]);

    expectSearchToEqual('beta testers', [
      'beta',
      'testers',
    ]);
  });

  it('should ensure longest portion of the word', () => {
    expectSearchToEqual('thinking about', [
      'thin',
      'king',
      'thinkin',
      'about',
    ]);

    expectSearchToEqual('individual experience', [
      'indiv',
      'idual',
      'individ',
      'exper',
      'ience',
      'experie',
    ]);
  });
});
