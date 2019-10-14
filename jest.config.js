module.exports = {
  verbose: true,
  preset: './packages/q3-api-test-utils',
  watchPlugins: ['jest-watch-yarn-workspaces'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  projects: ['<rootDir>/packages/*'],
};
