// This is a workaround for https://github.com/eslint/eslint/issues/3458
const { useESlint } = require('@kraftr/eslint-plugin/dist/eslint');

module.exports = useESlint({
  extends: ['plugin:@kraftr/lib'],
  plugins: ['@kraftr'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  ignorePatterns: ['.eslintrc.js']
});
