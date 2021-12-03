const { forEach } = require('lodash');
const aws = require('../config/aws');

module.exports = (item) => {
  const a = aws();
  let copy = item;

  try {
    const replacements = copy.match(
      new RegExp(/src="(?:[^'"]*)"/, 'gm'),
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
        copy = copy.replace(link, `src="${m}"`);
      } catch (e) {
        // noop
      }
    });

    return copy;
  } catch (e) {
    return copy;
  }
};
