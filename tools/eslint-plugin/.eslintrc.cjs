// This is a workaround for https://github.com/eslint/eslint/issues/3458
const { useESlint, lib } = require('./dist/eslint.cjs');

module.exports = useESlint({
  ...lib,
  plugins: lib.plugins.filter((p) => p !== '@kraftr'),
  rules: Object.fromEntries(
    Object.entries(lib.rules).filter(([rule]) => !rule.startsWith('@kraftr/'))
  ),
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['*.cjs', '*.js']
});
