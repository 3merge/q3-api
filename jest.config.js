module.exports = {
  verbose: true,
  preset: './packages/q3-api-test-utils',
  watchPlugins: ['jest-watch-yarn-workspaces'],
  projects: ['<rootDir>/packages/*'],
  testPathIgnorePatterns: [
    '<rootDir>/packages/(?:.+?)/dist/',
  ],
};
