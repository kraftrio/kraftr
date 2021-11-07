import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true
      }
    ]
  },
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['**/*.unit.ts', '**/*.integration.ts', '**/*.acceptance.ts']
};
export default config;
