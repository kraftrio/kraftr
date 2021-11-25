import type { Config } from '@jest/types';
import merge from 'deepmerge';

type JestConfig = Config.InitialOptions & {};

function useJest(config: JestConfig = {}) {
  const byDefault: JestConfig = {
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

  return merge(byDefault, config);
}

export { useJest };
