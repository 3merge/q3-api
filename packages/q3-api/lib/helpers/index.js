const { ExtendedReference } = require('q3-plugin-extref');
const handleImport = require('./handleImport');
const translate = require('./translate');
const utils = require('./utils');

module.exports = {
  ExtendedReference,
  handleImport,
  translate,
  ...utils,
};
