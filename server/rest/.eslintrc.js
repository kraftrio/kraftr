module.exports = {
  extends: ['plugin:@inxt/all'],
  plugins: ['@inxt'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
};
