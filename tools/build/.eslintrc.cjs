const { useESlint } = require('@kraftr/eslint-plugin/dist/eslint.cjs');

module.exports = useESlint({
  extends: ['plugin:@kraftr/lib'],
  plugins: ['@kraftr'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    '@kraftr/returns-throw': 'off'
  },
  ignorePatterns: ['*.cjs', '*.js']
});
