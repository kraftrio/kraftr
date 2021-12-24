import merge from 'deepmerge';
import Externals from 'rollup-plugin-auto-external';
import { Plugin } from 'vite';

/**
 * @public
 */
export type AutoExternalPluginConfig = Parameters<typeof Externals>[0];

/**
 * @public
 * @param config - available for this plugin
 * @returns rollup plugin to externalize dependencies
 */
export function autoExternal(config?: AutoExternalPluginConfig): Plugin[] {
  return [
    {
      enforce: 'pre',
      name: 'auto-external',
      resolveId(source) {
        if (source.startsWith('node:')) {
          return { id: source, external: true };
        }

        return null;
      }
    },
    Externals(
      merge(
        {
          builtins: true,
          dependencies: true,
          peerDependencies: true
        },
        config ?? {}
      )
    )
  ];
}
