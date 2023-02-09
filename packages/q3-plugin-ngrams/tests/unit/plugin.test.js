const mongoose = require('mongoose');
const plugin = require('../../lib/plugin');

const expectSearchToEqual = (str, expectedArray) =>
  expect(
    plugin.getSearch.call(
      {
        schema: new mongoose.Schema({
          name: {
            gram: true,
            type: String,
          },
        }),
      },
      str,
    ).ngrams.$all,
  ).toEqual(expectedArray);

test('it should skip ngrams', () => {
  expect(plugin.getSearch('coffee-beans and milk')).toEqual(
    {
      $text: {
        $search: '"coffee-beans" "and" "milk"',
        $caseSensitive: false,
      },
    },
  );
});

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
