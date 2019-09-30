module.exports = {
  verbose: true,
  testEnvironment: 'node',
  watchPlugins: ['jest-watch-yarn-workspaces'],
  cacheDirectory: '.jest-cache',
  coverageDirectory: '.jest-coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/(?:.+?)/dist/',
  ],
  preset: './packages/q3-api-test-utils',
  testPathIgnorePatterns: [
    '<rootDir>/packages/(?:.+?)/dist/',
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  projects: ['<rootDir>/packages/*'],
};
