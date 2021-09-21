const {
  first,
  compact,
  forEach,
  map,
  uniq,
} = require('lodash');
const { compose } = require('lodash/fp');

module.exports = (text) => {
  let out = String(text);
  const marshal = compose(uniq, compact, map);

  const getWithinQuotes = (xs) => {
    try {
      return first(/".*?"/g.exec(xs)).replace(/"/g, '');
    } catch (e) {
      return null;
    }
  };

  return {
    find: () =>
      marshal(
        out.match(
          new RegExp(
            /<mj-include path="(?:[^'"]*)" \/>/,
            'gm',
          ),
        ),
        getWithinQuotes,
      ),

    replace(templates = []) {
      forEach(templates, (temp) => {
        try {
          out = out.replace(
            `<mj-include path="${temp.name}" />`,
            temp.mjml,
          );
        } catch (e) {
          // noop
        }
      });

      return this;
    },

    out() {
      return out;
    },
  };
};
