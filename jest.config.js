module.exports = {
  verbose: true,
  testEnvironment: 'node',
  cacheDirectory: '.jest-cache',
  coverageDirectory: '.jest-coverage',
  preset: './packages/q3-api-test-utils',
  testPathIgnorePatterns: [
    '<rootDir>/packages/(?:.+?)/dist/',
    '<rootDir>/packages/(?:.+?)/node_modules/',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/(?:.+?)/dist/',
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
