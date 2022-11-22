const { map, lowerCase, size } = require('lodash');
const stopwords = require('./stopwords');
const { cleanHtml, splitSentence } = require('./utils');

module.exports = class WordCount {
  getBodyRaw() {
    try {
      return cleanHtml(this.bodyContent.toString());
    } catch (e) {
      return '';
    }
  }

  setBodyStats() {
    const words = map(
      splitSentence(this.getBodyRaw()),
      lowerCase,
    );

    const talley = stopwords(words).reduce((acc, curr) => {
      const key = lowerCase(curr);
      if (acc[key]) acc[key] += 1;
      else acc[key] = 1;
      return acc;
    }, {});

    const density =
      Math.max(...Object.values(talley)) * 0.9;

    this.keywords = Object.entries(talley)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [word, value]) => {
        if (value > density) acc.push(word);
        return acc;
      }, [])
      .splice(0, 9);

    this.wordCount = size(words);
    return this;
  }
};
