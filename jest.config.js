import jestExpoPreset from 'jest-expo/jest-preset.js';

export default {
  ...jestExpoPreset,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    ...jestExpoPreset.moduleNameMapper,
  },
};
