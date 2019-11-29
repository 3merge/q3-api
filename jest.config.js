const glob = require('glob');

module.exports = {
  watchPlugins: [
    'jest-watch-yarn-workspaces',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects: ['<rootDir>/packages/*', '<rootDir>/tests/*'],
  watchPathIgnorePatterns: [
    '<rootDir>/packages/*/node_modules/*',
    '<rootDir>/node_modules',
  ],
  notify: true,
  verbose: true,
  roots: [
    '<rootDir>',
    ...glob
      .sync('./packages/*')
      .map((p) => p.replace(/^\./, '<rootDir>')),
  ],
};
