import { Plugin, PluginOption, UserConfig } from 'vite';
import {
  autoExternal,
  AutoExternalPluginConfig,
  apiExtractor,
  TSConfigPathsConfig
} from '../plugins';
import license, { Options as LicensePluginConfig } from 'rollup-plugin-license';
import { ApiExtractorPluginOptions } from '../plugins/api-extractor';
import { DTSPluginConfig, dts } from '../plugins/dts';
import { installer, InstallerPluginConfig } from '../plugins/auto-install';
import tsconfigPaths from 'vite-tsconfig-paths';

const libraryPlugin: Plugin = {
  name: 'library-preset',
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
/**
 * Configurations for library preset
 * @public
 */
export type LibraryPresetConfig = {
  apiExtractor?: ApiExtractorPluginOptions;
  autoExternal?: AutoExternalPluginConfig;
  license?: LicensePluginConfig;
  tsconfigPaths?: TSConfigPathsConfig;
  installer?: InstallerPluginConfig & { enabled: boolean };
  dts?: DTSPluginConfig;
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
export function libraryPreset(config?: LibraryPresetConfig): PluginOption[] {
  return [
    tsconfigPaths(config?.tsconfigPaths),
    config?.installer?.enabled === false ? null : installer(config?.installer),
    dts(),
    config?.apiExtractor?.enabled === true ? apiExtractor(config?.apiExtractor) : null,
    ...autoExternal(config?.autoExternal),
    libraryPlugin,
    license(config?.license ?? {})
  ];
}
