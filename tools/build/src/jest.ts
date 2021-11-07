import type { Config } from '@jest/types';
import merge from 'deepmerge';

export { Config };

export function useJest(config: Config.InitialOptions = {}): Config.InitialOptions {
  const byDefault: Config.InitialOptions = {
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
