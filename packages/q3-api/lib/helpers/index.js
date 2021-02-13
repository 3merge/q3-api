const handleImport = require('./handleImport');
const translate = require('./translate');
const utils = require('./utils');

module.exports = {
  handleImport,
  translate,
  ...utils,
};
