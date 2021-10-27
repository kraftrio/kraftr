import { defineConfig } from 'vite';
import { VitePluginkraftr } from './src/vite-plugin';
import dts from 'vite-plugin-dts';
// eslint-disable-next-line security-node/detect-non-literal-require-calls, @typescript-eslint/no-var-requires, unicorn/prefer-module
const { name, dependencies, devDependencies } = require(process.cwd() + '/package.json');
import autoExternal from 'rollup-plugin-auto-external';

const allDeps = [...Object.keys(dependencies), ...Object.keys(devDependencies)];

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    sourcemap: true,
    lib: {
      name,
      entry: './src/index.ts',
      formats: ['cjs', 'es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      output: {
        globals: {
          ...Object.fromEntries(
            allDeps.map((dep) => {
              const parts = dep.split('/').pop();
              return [dep, parts!];
            })
          ),
          'node:util': 'node_util'
        }
      },
      external: ['node:util']
    }
  },
  plugins: [
    autoExternal({
      builtins: true
    }),
    VitePluginkraftr(),
    dts({
      include: ['./src'],
      copyDtsFiles: true,
      insertTypesEntry: true,
      tsConfigFilePath: './tsconfig.json'
    })
  ]
});
