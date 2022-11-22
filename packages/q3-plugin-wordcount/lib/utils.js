const { compact, lowerCase, map } = require('lodash');

const cleanHtml = (xs) =>
  String(xs)
    .replace(
      /(<code>(((?!<\/code>)(.|\n))*)<\/code>)/gm,
      ' ',
    )
    // remove all tags
    .replace(/(<([^>]+)>)/gi, ' ')
    // replace multiple spaces, tabs and new lines
    .replace(/\s\s+/g, ' ')
    .trim();

const splitSentence = (xs) =>
  map(compact(String(xs).split(/\s+/g)), lowerCase);

module.exports = {
  cleanHtml,
  splitSentence,
};
