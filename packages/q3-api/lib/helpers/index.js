const { ExtendedReference } = require('q3-plugin-extref');
const DatabaseStream = require('./databaseStream');
const handleImport = require('./handleImport');
const refreshAwsLinks = require('./refreshAwsLinks');
const makeVirtualFilePathPlugin = require('./makeVirtualFilePathPlugin');
const multitenantPlugin = require('./multitenantPlugin');
const translate = require('./translate');
const utils = require('./utils');

module.exports = {
  DatabaseStream,
  ExtendedReference,
  handleImport,
  refreshAwsLinks,
  makeVirtualFilePathPlugin,
  multitenantPlugin,
  translate,
  ...utils,
};
