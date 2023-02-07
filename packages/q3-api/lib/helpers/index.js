const { ExtendedReference } = require('q3-plugin-extref');
const createNotificationForUser = require('./createNotificationForUser');
const DatabaseStream = require('./databaseStream');
const debounceCollect = require('./debounceCollect');
const handleImport = require('./handleImport');
const refreshAwsLinks = require('./refreshAwsLinks');
const makeVirtualFilePathPlugin = require('./makeVirtualFilePathPlugin');
const multitenantPlugin = require('./multitenantPlugin');
const unreadDocumentPlugin = require('./unreadDocumentPlugin');
const translate = require('./translate');
const utils = require('./utils');

module.exports = {
  DatabaseStream,
  ExtendedReference,
  createNotificationForUser,
  debounceCollect,
  handleImport,
  refreshAwsLinks,
  makeVirtualFilePathPlugin,
  multitenantPlugin,
  unreadDocumentPlugin,
  translate,
  ...utils,
};
