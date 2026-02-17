/**
 * Jest configuration (CommonJS) — charged automatiquement par jest
 * Utilise le preset ESM de ts-jest pour supporter TypeScript + ESM
 */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }],
  },

  transformIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/src/tests/unit/**/*.test.ts'],
};
