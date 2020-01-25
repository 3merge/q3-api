const glob = require('glob');

module.exports = {
  watchPlugins: [
    'jest-watch-yarn-workspaces',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects: ['<rootDir>/packages/*'],
  watchPathIgnorePatterns: [
    '<rootDir>/packages/*/node_modules/*',
    '<rootDir>/node_modules',
  ],
  roots: [
    '<rootDir>',
    ...glob
      .sync('./packages/*')
      .map((p) => p.replace(/^\./, '<rootDir>')),
  ],
};
