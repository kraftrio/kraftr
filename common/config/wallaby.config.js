module.exports = function (wallaby) {
  return {
    tests: ['**/*.unit.ts', '**/*.integration.ts', '**/*.acceptance.ts'],
    env: {
      type: 'node'
    },
    autoDetect: true
  };
};
