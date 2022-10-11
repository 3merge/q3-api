const { forEach } = require('lodash');
const aws = require('../config/aws');

module.exports = (item) => {
  const a = aws();

  const execOnAttribute = (attributeName, str) => {
    let copy = str;

    try {
      const replacements = copy.match(
        new RegExp(`${attributeName}="(?:[^'"]*)"`, 'gm'),
      );

      forEach(replacements, (link) => {
        try {
          const [bucket] = link.match(
            new RegExp(/.[a-z]+\/(.+)\?/, 'gm'),
          );

          const m = a.getPrivate(
            decodeURIComponent(
              bucket.replace(/(\?|\.[a-z]+\/)/gm, ''),
            ).replace(/%20/g, ' '),
          );

          // eslint-disable-next-line
          copy = copy.replace(
            link,
            `${attributeName}="${m}"`,
          );
        } catch (e) {
          // noop
        }
      });

      return copy;
    } catch (e) {
      return copy;
    }
  };

  return ['href', 'src'].reduce(
    (acc, curr) => execOnAttribute(curr, acc),
    item,
  );
};
