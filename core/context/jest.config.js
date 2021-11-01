module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true
      }
    ]
  },
  testMatch: ['**/*.unit.ts', '**/*.integration.ts', '**/*.acceptance.ts']
};
