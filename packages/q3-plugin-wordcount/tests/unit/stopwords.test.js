const stopwords = require('../../lib/stopwords');

describe('stopwords', () => {
  it('should remove recognized stop words', () => {
    expect(stopwords(['youll', 'special'])).toEqual([
      'special',
    ]);
  });
});
