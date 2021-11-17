import { Plugin } from 'vite';
import { loadPackageJSON } from 'local-pkg';
import merge from 'deepmerge';
import path from 'path';

export type EntriesPluginConfig = {
  cwd?: string;
};

/**
 * @public
 * @param pluginConfig - available for this plugin
 * @returns rollup plugin to externalize dependencies
 */
export function autoEntries(pluginConfig?: EntriesPluginConfig): Plugin {
  return {
    name: 'auto-entries',
    async config(config) {
      if (config.build?.rollupOptions?.input) return;
      const pkg = (await loadPackageJSON(
        pluginConfig?.cwd
      )) as typeof import('../../../package.json');
      if (!pkg.exports) return;
      config = {};
      config.build ??= {};
      config.build.rollupOptions ??= {};
      if (config.build.rollupOptions > 0) {
        return;
      }
      const exportValues = Object.values(pkg.exports);
      let output = (config.build.rollupOptions.output ??= []);
      if (!Array.isArray(output)) {
        output = [output];
      }

      config.build.rollupOptions.input = exportValues.map(
        (exportEntry) => exportEntry.source
      );
      if (exportValues.find((exportEntry) => exportEntry.import)) {
        output.push({ format: 'esm', entryFileNames: `[name].mjs` });
      }
      if (exportValues.find((exportEntry) => exportEntry.require)) {
        output.push({ format: 'cjs', entryFileNames: `[name].cjs` });
      }
    }
  };
}
