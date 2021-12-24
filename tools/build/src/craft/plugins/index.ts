export * from './auto-externals';
export * from './api-extractor';
export * from './auto-install';
export * from './dts';

import licensePlugin from 'rollup-plugin-license';
import tsconfigPaths from 'vite-tsconfig-paths';
export type TSConfigPathsConfig = Parameters<typeof tsconfigPaths>[0];

export { licensePlugin, tsconfigPaths };
