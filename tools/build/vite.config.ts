import { defineConfig } from 'vite';
import { VitePluginKraftr } from './src/vite-plugin';
import dts from 'vite-plugin-dts';
// eslint-disable-next-line security-node/detect-non-literal-require-calls, @typescript-eslint/no-var-requires, unicorn/prefer-module
const { name, dependencies, devDependencies } = require(process.cwd() + '/package.json');
import autoExternal from 'rollup-plugin-auto-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
const allDeps = [
  ...Object.keys(dependencies ?? []),
  ...Object.keys(devDependencies ?? [])
];

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
          'node:util': 'node_util',
          'node:http': 'node_http',
          'node:events': 'node_events'
        }
      },
      external: ['node:util', 'node:http', 'node:events']
    }
  },
  plugins: [
    nodeResolve(),
    autoExternal({
      builtins: true
    }),
    VitePluginKraftr(),
    dts({
      include: ['./src'],
      copyDtsFiles: true,
      insertTypesEntry: true,
      tsConfigFilePath: './tsconfig.json'
    })
  ]
});
