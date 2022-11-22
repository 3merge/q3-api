const { get } = require('lodash');
const WordCount = require('./WordCount');

const wordCountPlugin = (Schema, options = {}) => {
  Schema.add({
    wordCount: {
      type: Number,
      default: 0,
    },
    keywords: [String],
  });

  Schema.loadClass(WordCount);
  // eslint-disable-next-line
  Schema.virtual('bodyContent').get(function () {
    return get(this, get(options, 'path', 'body'));
  });

  return Schema;
};

module.exports = wordCountPlugin;
