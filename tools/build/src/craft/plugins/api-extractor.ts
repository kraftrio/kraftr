import {
  CompilerState,
  Extractor,
  ExtractorConfig,
  IConfigFile
} from '@microsoft/api-extractor';
import path from 'node:path';
import { Plugin } from 'vite';
import { unlink as unlinkCallback, readdirSync, statSync, rmdirSync } from 'node:fs';
import { promisify } from 'node:util';
const unlink = promisify(unlinkCallback);
import merge from 'deepmerge';
import { OutputBundle, PluginContext } from 'rollup';
/**
 * @public
 */
export type ApiExtractorPluginOptions = {
  enabled?: boolean;
  /**
   * The path to the api extractor configuration file. defaults to ./config/api-extractor.json
   */
  configFile?: string;
  configuration?: Partial<IConfigFile>;

  /**
   * Remove all the d.ts files after finish (if dtsRollup is enable)
   */
  clean?: boolean;

  /**
   * Indicates that API Extractor is running as part of a local build, e.g. on a developer's machine
   */
  local?: boolean;
  verbose?: boolean;

  /**
   * Show diagnostic messages used for troubleshooting problems with API Extractor.
   */
  diagnostics?: boolean;

  /**
   * Override the typescript version that api-extractor uses. see [api-extractor documantation for more information])(https://api-extractor.com/pages/commands/api-extractor_run/)
   */
  typescriptFolder?: string;
};

function findOutputName(entry: string, bundle: OutputBundle) {
  const outputName = Object.values(bundle).find(
    (value) =>
      value.type === 'chunk' &&
      value.fileName.endsWith('.d.ts') &&
      value.facadeModuleId === entry
  )?.fileName;

  if (!outputName) {
    throw new Error(`There is no .d.ts file for ${entry} entry`);
  }

  return outputName;
}

function generateTrimmedPath(entryPoint: string) {
  return {
    betaTrimmedFilePath: entryPoint.replace(/\.d\.ts/, '-beta.d.ts'),
    publicTrimmedFilePath: entryPoint.replace(/\.d\.ts/, '.d.mts'),
    untrimmedFilePath: entryPoint.replace(/\.d\.ts/, '-all.d.ts')
  };
}

function extractAPI(
  this: PluginContext,
  extractorConfig: ExtractorConfig,
  localBuild: boolean,
  compilerState?: CompilerState,
  pluginOptions?: ApiExtractorPluginOptions
) {
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild,
    compilerState,
    showDiagnostics: pluginOptions?.diagnostics,
    showVerboseMessages: pluginOptions?.verbose,
    messageCallback(message) {
      if (message.messageId === 'console-preamble') {
        message.logLevel = 'none' as never;
      }
    }
  });

  if (extractorResult.errorCount > 0) {
    this.error(
      `API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`
    );
  } else if (!extractorResult.succeeded) {
    this.warn(`API Extractor completed with ${extractorResult.warningCount} warnings`);
  }
}

/**
 * @public
 * @param pluginOptions - to configure api extractor
 * @returns Vite plugin
 */
export function apiExtractor(pluginOptions?: ApiExtractorPluginOptions): Plugin {
  let root = process.cwd();
  const compilerState: Record<string, CompilerState> = {};
  const dtsFiles = new Set<string>();

  let outDir: string;
  let mode: string;
  let entries: string[];
  let generated = false;
  return {
    name: 'api-extractor',
    configResolved(config) {
      mode = config.mode;
      const input = config.build.rollupOptions.input as string[];
      entries = input.map((value) => path.resolve(config.root ?? root, value));
      root = config.root ?? root;
      outDir = config.build.outDir ?? path.join(root, 'dist');
    },
    watchChange() {
      generated = false;
    },
    async writeBundle(_, bundle) {
      if (generated) return;
      generated = true;

      const localBuild = pluginOptions?.local ?? (mode === 'production' ? false : true);
      const configObjectFullPath = path.resolve(
        root,
        pluginOptions?.configFile ?? './config/api-extractor.json'
      );

      const aeConfig = ExtractorConfig.loadFile(configObjectFullPath);
      const outDefs = new Set<string>();

      for (const entry of entries) {
        const outputName = findOutputName(entry, bundle);
        const mainEntryPointFilePath = path.resolve(outDir, outputName);

        const { betaTrimmedFilePath, publicTrimmedFilePath, untrimmedFilePath } =
          generateTrimmedPath(path.resolve(outDir, path.basename(outputName)));

        outDefs.add(betaTrimmedFilePath);
        outDefs.add(publicTrimmedFilePath);
        outDefs.add(untrimmedFilePath);

        const configObject = merge.all([
          aeConfig,
          {
            mainEntryPointFilePath,
            dtsRollup: {
              enabled: true,
              betaTrimmedFilePath,
              publicTrimmedFilePath,
              untrimmedFilePath
            },
            apiReport: {
              enabled: true,
              reportFileName: path.parse(entry).name + '.api.md'
            }
          },
          pluginOptions?.configuration ?? {}
        ]) as IConfigFile;

        const extractorConfig = ExtractorConfig.prepare({
          configObject,
          packageJsonFullPath: path.join(root, 'package.json'),
          configObjectFullPath
        });

        if (!compilerState[mainEntryPointFilePath]) {
          compilerState[mainEntryPointFilePath] = CompilerState.create(extractorConfig);
        }

        extractAPI.call(
          this,
          extractorConfig,
          localBuild,
          compilerState[mainEntryPointFilePath],
          pluginOptions
        );
      }

      Object.keys(bundle)
        .map((key) => path.resolve(outDir, key))
        .filter((key) => key && /\.d\.ts/.test(key) && !outDefs.has(key))
        .forEach((key) => dtsFiles.add(key));
    },
    async closeBundle() {
      if (pluginOptions?.clean !== false && outDir) {
        await Promise.all([...dtsFiles].map((filename) => unlink(filename)));
        cleanEmptyFoldersRecursively(outDir);
        dtsFiles.clear();
      }
    }
  };
}

function cleanEmptyFoldersRecursively(folder: string) {
  var isDir = statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function (file) {
      var fullPath = path.join(folder, file);
      cleanEmptyFoldersRecursively(fullPath);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = readdirSync(folder);
  }

  if (files.length == 0) {
    rmdirSync(folder);
  }
}
