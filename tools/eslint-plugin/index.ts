import { Linter } from 'eslint';
import { noUnusedResult } from './lib/rules/no-unused-result';

const base: Linter.Config = {
  ignorePatterns: ['.eslintrc.js'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security-node/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'security-node'],
  parser: '@typescript-eslint/parser',
  env: {
    node: true
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    'no-console': process.env['NODE_ENV'] !== 'production' ? 'error' : 'warn',
    'no-debugger': process.env['NODE_ENV'] !== 'production' ? 'error' : 'warn',

    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@kraftr/no-unused-result': 'error',
    '@typescript-eslint/typedef': 'off',
    '@typescript-eslint/no-floating-promises': 'error',

    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ]
  }
};
const recommended: Linter.Config = {
  ...base,
  extends: [...base.extends!, 'plugin:unicorn/recommended', 'prettier'],
  plugins: [...base.plugins!, 'unused-imports'],
  rules: {
    ...base.rules,
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/empty-brace-spaces': 'off',
    'unicorn/no-null': 'off'
  }
};
const all: Linter.Config = {
  ...recommended
};

const plugin = {
  rules: {
    'no-unused-result': noUnusedResult
  },
  configs: {
    all,
    recommended,
    base
  }
};

export = plugin;
