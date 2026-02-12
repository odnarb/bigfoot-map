/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/server/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.js',
  ],
  collectCoverageFrom: ['server/src/**/*.js'],
  verbose: true,
  transform: {},
};
