import merge from 'deepmerge';
import fg from 'fast-glob';
import { loadPackageJSON } from 'local-pkg';
import { isPromise } from 'node:util/types';
import { Command } from 'soly';
import { ConfigEnv, PluginOption, UserConfig, UserConfigExport } from 'vite';

type PackageJSON = Partial<typeof import('../../package.json')>;

export type CraftPluginOption =
  | (PluginOption & {
      commands?: Record<string, (cmd: Command) => void>;
    })
  | false
  | null
  | undefined;

export type CraftPlugins = (CraftPluginOption | CraftPluginOption[])[];

/**
 * @public
 * extended from vite to provide extra options
 */
export type CraftConfig = UserConfig & {
  entries: string[] | string;
  plugins?: CraftPlugins;
};

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
 * @param config - CraftConfig to use to configure Craft
 * @returns UserConfigExport object
 */
export function defineConfig(config: CraftConfigExport): UserConfigExport {
  return async (env) => {
    const pkg = (await loadPackageJSON()) as PackageJSON;

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
          entry: pkg.main ?? 'lib'
        },
        rollupOptions: {
          input: await fg(entries),
          output: []
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
