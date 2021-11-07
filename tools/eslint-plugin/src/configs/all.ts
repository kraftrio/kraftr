import { Linter } from 'eslint';
import merge from 'deepmerge';
import { recommended } from '.';

export const all: Linter.Config = merge(
  recommended,
  {
    rules: {
      'unicorn/prevent-abbreviations': [
        'warn',
        {
          allowList: {
            Err: true
          }
        }
      ],
      'unicorn/no-abusive-eslint-disable': 'error',
      '@kraftr/no-unused-result': 'error',
      '@kraftr/returns-throw': 'error'
    }
  },
  { arrayMerge: (_, source) => source }
);
