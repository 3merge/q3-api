module.exports = {
  preset: './packages/q3-test-utils',
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
};
