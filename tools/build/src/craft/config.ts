import merge from 'deepmerge';
import { isPromise } from 'node:util/types';
import { ConfigEnv, UserConfig, UserConfigExport } from 'vite';
import { loadPackageJSON } from 'local-pkg';
import fg from 'fast-glob';

/**
 * @public
 * extended from vite to provide extra options
 */
export type CraftConfig = {
  entries: string[] | string;
} & UserConfig;

/**
 * @public
 * extended from vite to provide extra options
 */
export type CraftConfigExport =
  | CraftConfig
  | Promise<CraftConfig>
  | ((env: ConfigEnv) => CraftConfig | Promise<CraftConfig>);

/**
 * @public
 * @param config - CraftConfig to use to configure craft
 * @returns UserConfigExport object
 */
export function defineConfig(config: CraftConfigExport): UserConfigExport {
  return async (env) => {
    const pkg = (await loadPackageJSON()) as typeof import('../../package.json');

    let returnConfig: CraftConfig;
    if (isPromise(config)) {
      returnConfig = await config;
    } else if (typeof config === 'function') {
      returnConfig = await config(env);
    } else {
      returnConfig = config;
    }

    const { entries, ...viteConfigs } = returnConfig;

    const requiredConfig: UserConfig = {
      build: {
        lib: {
          name: pkg.name,
          entry: pkg.main
        },
        rollupOptions: {
          input: await fg(entries),
          output: { entryFileNames: '[name].[format].js' }
        }
      },
      optimizeDeps: {
        entries: []
      }
    };

    const defaultConfig: UserConfig = {};

    return merge.all([defaultConfig, viteConfigs, requiredConfig], {
      arrayMerge: (_, source) => source
    });
  };
}
