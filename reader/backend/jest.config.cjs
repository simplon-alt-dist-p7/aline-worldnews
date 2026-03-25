module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  testMatch: ['**/src/tests/**/*.test.js'],
  coverageReporters: ['json-summary', 'text'],
};
