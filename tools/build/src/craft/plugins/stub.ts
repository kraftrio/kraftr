import path from 'node:path';
import { OutputChunk } from 'rollup';
import { Plugin } from 'vite';

/**
 * @public
 * @returns Vite Plugin
 */
export function stub(): Plugin {
  let generated = false;
  const cache = new Map<string, OutputChunk>();
  return {
    name: 'stub',
    apply: 'build',
    generateBundle(outputOptions, bundle) {
      if (outputOptions.format !== 'es' && outputOptions.format !== 'cjs') return;
      for (const [filename, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' || !(chunk.isImplicitEntry || chunk.isEntry)) {
          delete bundle[filename];
          continue;
        }
        if (!chunk.facadeModuleId) continue;
        const absOut = path.dirname(path.join(outputOptions.dir ?? '', filename));

        const relativePath = path
          .relative(absOut, chunk.facadeModuleId)
          .replace(/.tsx?$/, '');

        let code = '';
        const isDts = filename.endsWith('.d.ts');

        if (isDts && generated) continue;

        if (isDts) {
          code =
            `export * from '${relativePath}'\n` +
            `export { default } from '${relativePath}'\n`;
        } else if (outputOptions.format === 'es') {
          const _exports = chunk.exports.filter((v) => !v.startsWith('*')).join(', ');
          const allExports = chunk.exports.filter((v) => v.startsWith('*'));
          code =
            `import { jiti } from '@kraftr/build';\n` +
            `const _module = jiti(null, { interopDefault: true })('${chunk.facadeModuleId}')\n` +
            `export default _module\n` +
            `export const { ${_exports} } = _module\n`;
          for (const _export of allExports) {
            code += `export * from '${_export.slice(1)}';\n`;
          }
        } else {
          code = `module.exports = require('@kraftr/build').jiti(__filename, { interopDefault: true })('${chunk.facadeModuleId}');\n`;
        }

        bundle[filename] = {
          ...chunk,
          type: 'chunk',
          modules: {},
          code
        };

        if (isDts) {
          cache.set(filename, {
            ...chunk,
            type: 'chunk',
            modules: {},
            code
          });
        }
      }
      for (const [filename, chunk] of cache) {
        bundle[filename] = chunk;
      }
      generated = true;
    }
  };
}
