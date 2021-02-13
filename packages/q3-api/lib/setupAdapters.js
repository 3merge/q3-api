const files = require('q3-core-files');

module.exports = (adapterNames) =>
  adapterNames.forEach((item) => {
    if (files.strategies.includes(item)) files.init(item);
  });
