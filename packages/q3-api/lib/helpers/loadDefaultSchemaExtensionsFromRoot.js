const path = require('path');
const fs = require('fs');
const { capitalize } = require('lodash');

const pluralize = (xs) => `${xs}s`;

const requireFromCwd = (filename) => {
  [
    filename,
    pluralize(filename),
    capitalize(filename),
    capitalize(pluralize(filename)),
  ].every((item) => {
    const dir = path.join(
      process.cwd(),
      `./lib/models/${item}`,
    );

    if (fs.existsSync(dir)) {
      // eslint-disable-next-line
      require(dir);
      return false;
    }

    return true;
  });
};

// these are really the only schemas projects need to extend
['domain', 'notification', 'user'].forEach(requireFromCwd);
