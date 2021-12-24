import { loadPackageJSON } from 'local-pkg';
import { Plugin } from 'vite';

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
      const input = config.build?.rollupOptions?.input;

      if (!input || input?.length > 0) return;
      const pkg = (await loadPackageJSON(
        pluginConfig?.cwd
      )) as typeof import('../../../package.json');
      if (!pkg.exports) return;

      config = config ?? {};
      config.build ??= {};
      config.build.rollupOptions ??= {};

      const exportValues = Object.values(pkg.exports);
      const rollupOptions = config.build.rollupOptions;

      let output = (rollupOptions.output ??= []);
      if (!Array.isArray(output)) {
        output = [output];
      }

      config.build.rollupOptions.input = exportValues.map(
        (exportEntry) => exportEntry.source
      );

      if (output.length === 0 && exportValues.find((export_) => export_.import)) {
        output.push({ format: 'esm', entryFileNames: `[name].mjs` });
      }
      if (output.length === 0 && exportValues.find((export_) => export_.require)) {
        output.push({ format: 'cjs', entryFileNames: `[name].cjs` });
      }
      rollupOptions.output = output;
    }
  };
}
