import { Linter } from 'eslint';
import { base } from './base';
import merge from 'deepmerge';

export const recommended: Linter.Config = merge(
  base,
  {
    rules: {
      'sonarjs/cognitive-complexity': ['warn', 12],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      'unicorn/prefer-ternary': 'warn',
      'unicorn/prefer-top-level-await': 'warn',
      '@kraftr/no-unused-result': 'error',
      'unicorn/error-message': 'warn'
    }
  },
  { arrayMerge: (_, source) => source }
);
