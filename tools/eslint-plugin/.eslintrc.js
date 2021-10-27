// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');
module.exports = {
  ignorePatterns: ['.eslintrc.js'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security-node/recommended',
    'plugin:unicorn/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'security-node', 'unused-imports'],
  parser: '@typescript-eslint/parser',
  env: {
    node: true
  },
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    'no-console': process.env['NODE_ENV'] !== 'production' ? 'error' : 'warn',
    'no-debugger': process.env['NODE_ENV'] !== 'production' ? 'error' : 'warn',

    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
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
