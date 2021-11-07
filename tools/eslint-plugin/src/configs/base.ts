import { Linter } from 'eslint';

const rules: Linter.RulesRecord = {
  // sonar https://github.com/SonarSource/eslint-plugin-sonarjs
  'sonarjs/cognitive-complexity': 'off',

  // typescript-eslint
  '@typescript-eslint/no-floating-promises': 'error',

  '@typescript-eslint/no-namespace': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/explicit-member-accessibility': 'off',
  '@typescript-eslint/typedef': 'off',

  // unicorn
  // base
  'unicorn/throw-new-error': 'error',
  'no-nested-ternary': 'error',

  // recommended
  'unicorn/prefer-ternary': 'off',
  'unicorn/error-message': 'off',
  'unicorn/prefer-top-level-await': 'off',

  // lib
  'unicorn/prefer-node-protocol': 'off',

  'unicorn/better-regex': 'off',
  'unicorn/catch-error-name': 'off',
  'unicorn/consistent-destructuring': 'off',
  'unicorn/consistent-function-scoping': 'off',
  'unicorn/custom-error-definition': 'off',
  'unicorn/empty-brace-spaces': 'off',
  'unicorn/escape-case': 'off',
  'unicorn/explicit-length-check': 'off',
  'unicorn/filename-case': 'off',
  'unicorn/import-index': 'off',
  'unicorn/import-style': 'off',
  'unicorn/new-for-builtins': 'off',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-array-for-each': 'off',
  'unicorn/no-array-method-this-argument': 'off',
  'unicorn/no-array-push-push': 'off',
  'unicorn/no-array-reduce': 'off',
  'unicorn/no-console-spaces': 'off',
  'unicorn/no-document-cookie': 'off',
  'unicorn/no-empty-file': 'off',
  'unicorn/no-for-loop': 'off',
  'unicorn/no-hex-escape': 'off',
  'unicorn/no-instanceof-array': 'off',
  'unicorn/no-invalid-remove-event-listener': 'off',
  'unicorn/no-keyword-prefix': 'off',
  'unicorn/no-lonely-if': 'off',
  'unicorn/no-nested-ternary': 'off',
  'unicorn/no-new-array': 'off',
  'unicorn/no-new-buffer': 'off',
  'unicorn/no-null': 'off',
  'unicorn/no-object-as-default-parameter': 'off',
  'unicorn/no-process-exit': 'off',
  'unicorn/no-static-only-class': 'off',
  'unicorn/no-this-assignment': 'off',
  'unicorn/no-unreadable-array-destructuring': 'off',
  'unicorn/no-unsafe-regex': 'off',
  'unicorn/no-unused-properties': 'off',
  'unicorn/no-useless-fallback-in-spread': 'off',
  'unicorn/no-useless-length-check': 'off',
  'unicorn/no-useless-spread': 'off',
  'unicorn/no-useless-undefined': 'off',
  'unicorn/no-zero-fractions': 'off',
  'unicorn/number-literal-case': 'off',
  'unicorn/numeric-separators-style': 'off',
  'unicorn/prefer-add-event-listener': 'off',
  'unicorn/prefer-array-find': 'off',
  'unicorn/prefer-array-flat': 'off',
  'unicorn/prefer-array-flat-map': 'off',
  'unicorn/prefer-array-index-of': 'off',
  'unicorn/prefer-array-some': 'off',
  'unicorn/prefer-at': 'off',
  'unicorn/prefer-date-now': 'off',
  'unicorn/prefer-default-parameters': 'off',
  'unicorn/prefer-dom-node-append': 'off',
  'unicorn/prefer-dom-node-dataset': 'off',
  'unicorn/prefer-dom-node-remove': 'off',
  'unicorn/prefer-dom-node-text-content': 'off',
  'unicorn/prefer-export-from': 'off',
  'unicorn/prefer-includes': 'off',
  'unicorn/prefer-keyboard-event-key': 'off',
  'unicorn/prefer-math-trunc': 'off',
  'unicorn/prefer-modern-dom-apis': 'off',
  'unicorn/prefer-module': 'off',
  'unicorn/prefer-negative-index': 'off',
  'unicorn/prefer-number-properties': 'off',
  'unicorn/prefer-object-from-entries': 'off',
  'unicorn/prefer-object-has-own': 'off',
  'unicorn/prefer-optional-catch-binding': 'off',
  'unicorn/prefer-prototype-methods': 'off',
  'unicorn/prefer-query-selector': 'off',
  'unicorn/prefer-reflect-apply': 'off',
  'unicorn/prefer-regexp-test': 'off',
  'unicorn/prefer-set-has': 'off',
  'unicorn/prefer-spread': 'off',
  'unicorn/prefer-string-replace-all': 'off',
  'unicorn/prefer-string-slice': 'off',
  'unicorn/prefer-string-starts-ends-with': 'off',
  'unicorn/prefer-string-trim-start-end': 'off',
  'unicorn/prefer-switch': 'off',
  'unicorn/prefer-type-error': 'off',
  'unicorn/require-array-join-separator': 'off',
  'unicorn/require-number-to-fixed-digits-argument': 'off',
  'unicorn/require-post-message-target-origin': 'off',
  'unicorn/string-content': 'off',
  'unicorn/template-indent': 'off',
  // all
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/no-abusive-eslint-disable': 'off',

  // unused
  'unicorn/expiring-todo-comments': 'off',
  '@typescript-eslint/sort-type-union-intersection-members': 'off', // some types like throw should be last

  'dot-notation': 'off',
  'no-console': process.env['NODE_ENV'] !== 'production' ? 'error' : 'warn',
  'no-debugger': process.env['NODE_ENV'] !== 'production' ? 'error' : 'warn',

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
};

export const base: Linter.Config = {
  extends: ['plugin:sonarjs/recommended', 'prettier'],
  plugins: [
    '@typescript-eslint',
    'sonarjs',
    'unicorn',
    'unused-imports',
    'write-good-comments'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020
  },
  env: {
    node: true
  },
  rules
};
