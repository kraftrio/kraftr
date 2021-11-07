const { useESlint } = require('@kraftr/eslint-plugin/dist/eslint');

module.exports = useESlint({
  extends: ['plugin:@kraftr/all'],
  plugins: ['@kraftr'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
});
