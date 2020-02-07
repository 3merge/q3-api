module.exports = {
  watchPlugins: [
    'jest-watch-yarn-workspaces',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects: ['<rootDir>/packages/*', '<rootDir>/tests'],
  watchPathIgnorePatterns: [
    '<rootDir>/packages/*/node_modules/*',
    '<rootDir>/node_modules',
  ],
  verbose: true,
  testEnvironment: 'node',
  preset: 'q3-test-utils',
  setupFilesAfterEnv: ['q3-test-utils/jest-setup.js'],
};
