import { Plugin, PluginOption, UserConfig } from 'vite';
import { autoExternal, AutoExternalPluginConfig, TSConfigPathsConfig } from '../plugins';
import { installer, InstallerPluginConfig } from '../plugins/auto-install';
import tsconfigPaths from 'vite-tsconfig-paths';

const applicationPlugin: Plugin = {
  name: 'application-preset',
  config: () =>
    ({
      build: {
        sourcemap: 'inline',
        lib: {},
        rollupOptions: {
          output: [
            { format: 'es', entryFileNames: '[name].mjs', chunkFileNames: '[name].mjs' },
            { format: 'cjs', entryFileNames: '[name].cjs', chunkFileNames: '[name].cjs' }
          ]
        }
      }
    } as UserConfig)
};
// const dts = require('vite-dts').default;
/**
 * Configurations for application preset
 * @public
 */
export type ApplicationPresetConfig = {
  autoExternal?: AutoExternalPluginConfig;
  installer?: InstallerPluginConfig & { enabled: boolean };
  tsconfigPaths: TSConfigPathsConfig;
};
/**
 * This preset include the following plugins
 * - dts (for typescript declarations)
 * - apiExtractor (to bundle the typescript declarations)
 * - autoExternal (plugin to mark any dependency from node_modules or builtin as external)
 * - license (to embed the license in the output)
 * @public
 * @param config - for this preset
 * @returns
 */
export function applicationPreset(config?: ApplicationPresetConfig): PluginOption[] {
  return [
    tsconfigPaths(),
    config?.installer?.enabled === false ? null : installer(config?.installer),
    ...autoExternal(config?.autoExternal),
    applicationPlugin
  ];
}
