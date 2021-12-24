import { Linter } from 'eslint';
import merge from 'deepmerge';
import { recommended } from '.';

export const lib: Linter.Config = merge(
  recommended,
  {
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'unicorn/prefer-node-protocol': 'error',
      '@kraftr/no-unused-result': 'error',
      '@kraftr/returns-throw': 'error'
    }
  },
  { arrayMerge: (_, source) => source }
);
