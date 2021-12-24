import license, { Options as LicensePluginConfig } from 'rollup-plugin-license';
import { Plugin, PluginOption, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import {
  apiExtractor,
  autoExternal,
  AutoExternalPluginConfig,
  TSConfigPathsConfig
} from '../plugins';
import { ApiExtractorPluginOptions } from '../plugins/api-extractor';
import { installer, InstallerPluginConfig } from '../plugins/auto-install';
import { dts, DTSPluginConfig } from '../plugins/dts';

const libraryPlugin: Plugin = {
  name: 'library-preset',
  config: () =>
    ({
      build: {
        lib: {},
        rollupOptions: {
          output: [
            {
              format: 'es',
              entryFileNames: '[name].mjs',
              chunkFileNames: 'chunks/[name].mjs'
            },
            {
              format: 'cjs',
              entryFileNames: '[name].cjs',
              chunkFileNames: 'chunks/[name].cjs'
            }
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
    ...autoExternal(config?.autoExternal),
    config?.apiExtractor?.enabled === true ? apiExtractor(config?.apiExtractor) : null,
    libraryPlugin,
    license(config?.license ?? {})
  ];
}
