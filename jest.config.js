module.exports = {
  verbose: true,
  preset: './packages/q3-api-test-utils',
  watchPlugins: ['jest-watch-yarn-workspaces'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  projects: [
    '<rootDir>/packages/q3-api',
    '<rootDir>/packages/q3-api-plugin-files',
    '<rootDir>/packages/q3-api-plugin-notes',
    '<rootDir>/packages/q3-core-composer',
    '<rootDir>/packages/q3-core-mailer',
    '<rootDir>/packages/q3-core-walker',
  ],
};
