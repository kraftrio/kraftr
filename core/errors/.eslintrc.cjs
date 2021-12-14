const { useESlint } = require('@kraftr/eslint-plugin/dist/eslint.cjs');

module.exports = useESlint({
  extends: ['plugin:@kraftr/lib'],
  plugins: ['@kraftr'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['cjs']
  },
  ignorePatterns: ['.eslintrc.cjs']
});
