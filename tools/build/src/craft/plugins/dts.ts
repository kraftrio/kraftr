import { Plugin } from 'vite';
import ts from 'typescript';
import path from 'node:path';
import merge from 'deepmerge';

/**
 * @public
 * dts plugin configuration
 */
export type DTSPluginConfig = {
  compilerOptions: ts.CompilerOptions;
};

/**
 * @public
 * @returns Vite Plugin
 */
export function dts(config?: DTSPluginConfig): Plugin {
  const host = ts.createIncrementalCompilerHost({});
  let builder: ts.EmitAndSemanticDiagnosticsBuilderProgram;
  let files = new Set<string>();
  let generated = false;
  return {
    name: 'dts',
    apply: 'build',
    buildStart() {
      files = new Set();
      generated = false;
    },
    load(file) {
      files.add(file);
      return null;
    },
    generateBundle(outputOptions, bundle) {
      if (generated) return;
      generated = false;
      const { dir } = outputOptions;

      if (!dir) {
        // eslint-disable-next-line @kraftr/returns-throw
        throw new Error('output dir is not defined');
      }

      if (!builder) {
        builder = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
          [...files],
          merge(
            {
              declaration: true,
              emitDeclarationOnly: true,
              outDir: dir
            },
            config?.compilerOptions ?? {}
          ),
          host
        );
      }

      builder.emit(
        undefined,
        (filePath, code, _, __, sourceFiles) => {
          const fileName = path.relative(dir, filePath);
          const facadeModuleId = sourceFiles?.[0]?.fileName!;
          const srcName = path.relative(dir, facadeModuleId);
          const file = bundle[srcName];
          bundle[fileName] = {
            type: 'chunk',
            code,
            fileName,
            imports: [],
            dynamicImports: [],
            exports: [],
            isDynamicEntry: true,
            isEntry: false,
            isImplicitEntry: true,
            facadeModuleId,
            referencedFiles: [],
            modules: {},
            importedBindings: {},
            implicitlyLoadedBefore: [],
            name: fileName
          };
        },
        undefined,
        true
      );
    }
  };
}
