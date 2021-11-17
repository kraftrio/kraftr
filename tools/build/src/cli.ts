import { cac } from 'cac';
import chalk from 'chalk';
import { performance } from 'node:perf_hooks';
import {
  BuildOptions,
  createLogger,
  InlineConfig,
  LogLevel,
  mergeConfig,
  resolveConfig,
  ServerOptions
} from 'vite';
import { version } from '../package.json';
import ts from 'typescript';
const cli = cac('craft');
import { defineConfig, libraryPreset } from './craft';
// global options
type GlobalCLIOptions = {
  '--'?: string[];
  c?: boolean | string;
  config?: string;
  base?: string;
  l?: LogLevel;
  logLevel?: LogLevel;
  clearScreen?: boolean;
  d?: boolean | string;
  debug?: boolean | string;
  f?: string;
  filter?: string;
  preset?: 'app' | 'lib';
  root?: string;
  m?: string;
  mode?: string;
};

async function findConfig() {
  const { findUp } = await import('find-up');
  return await findUp(['craft.config.ts']);
}

/**
 * removing global flags before passing as command specific sub-configs
 */
function cleanOptions<Options extends GlobalCLIOptions>(
  options: Options
): Omit<Options, keyof GlobalCLIOptions> {
  const ret = { ...options };
  delete ret['--'];
  delete ret.c;
  delete ret.config;
  delete ret.base;
  delete ret.l;
  delete ret.logLevel;
  delete ret.clearScreen;
  delete ret.d;
  delete ret.debug;
  delete ret.root;
  delete ret.preset;
  delete ret.f;
  delete ret.filter;
  delete ret.m;
  delete ret.mode;
  return ret;
}

cli
  .option('-c, --config <file>', `[string] use specified config file`)
  .option('--base <path>', `[string] public base path (default: /)`)
  .option('-l, --logLevel <level>', `[string] info | warn | error | silent`)
  .option('--clearScreen', `[boolean] allow/disable clear screen when logging`)
  .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
  .option('-f, --filter <filter>', `[string] filter debug logs`)
  .option('-m, --mode <mode>', `[string] set env mode`);

// dev
cli
  .command('serve [root]') // default command
  .alias('dev') // alias to align with the script name
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--https', `[boolean] use TLS + HTTP/2`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .option('--cors', `[boolean] enable CORS`)
  .option('--strictPort', `[boolean] exit if specified port is already in use`)
  .option('--force', `[boolean] force the optimizer to ignore the cache and re-bundle`)
  .action(async (root: string, options: ServerOptions & GlobalCLIOptions) => {
    const { createServer } = await import('vite');
    if (!options.config) {
      options.config = await findConfig();
    }
    try {
      const server = await createServer({
        root,
        base: options.base,
        mode: options.mode,
        configFile: options.config,
        logLevel: options.logLevel,
        clearScreen: options.clearScreen,
        server: cleanOptions(options)
      });

      if (!server.httpServer) {
        throw new Error('HTTP server not available');
      }

      await server.listen();

      const info = server.config.logger.info;

      info(
        chalk.cyan(`\n  craft v${version}`) + chalk.green(` dev server running at:\n`),
        {
          clear: !server.config.logger.hasWarned
        }
      );

      server.printUrls();

      // @ts-ignore
      if (global.__vite_start_time) {
        // @ts-ignore
        const startupDuration = performance.now() - global.__vite_start_time;
        info(chalk`\n  {cyan ready in ${Math.ceil(startupDuration)}ms.}\n`);
      }
    } catch (e) {
      const error = e as Error;
      createLogger(options.logLevel).error(
        chalk.red(`error when starting dev server:\n${error.stack}`),
        { error }
      );
      process.exit(1);
    }
  });

// build
cli
  .command('[...entries]') // default command
  .alias('build')
  .alias('package')
  .option('--target <target>', `[string] transpile target (default: 'modules')`)
  .option('--preset <target>', `["lib" | "app"] preset to use (default: 'lib')`)
  .option('--root <target>', `[string] root directory (default: 'cwd')`)
  .option('--outDir <dir>', `[string] output directory (default: dist)`)
  .option('--sourcemap', `[boolean] output source maps for build (default: false)`)
  .option(
    '--minify [minifier]',
    `[boolean | "terser" | "esbuild"] enable/disable minification, ` +
      `or specify minifier to use (default: esbuild)`
  )
  .option('--emptyOutDir', `[boolean] force empty outDir when it's outside of root`)
  .option('-w, --watch', `[boolean] rebuilds when modules have changed on disk`)
  .action(
    async (entries: string[] | string, options: BuildOptions & GlobalCLIOptions) => {
      const root = options.root;
      const buildOptions: BuildOptions = cleanOptions(options);
      const { build } = await import('vite');

      if (!options.config) {
        options.config = await findConfig();
      }
      if (!options.config) {
        options.preset ??= 'lib';
      }
      const logger = createLogger('info', { prefix: 'craft' });
      buildOptions.lib = {
        entry: './src/index.ts',
        name: 'craft'
      };
      const presetMsg = options.preset ? ` [preset: '${options.preset}'] ` : '';
      logger.info(chalk`{cyan craft v${version}${presetMsg}}\n`, {
        clear: false
      });

      const configPath = ts.findConfigFile(
        root ?? process.cwd(),
        ts.sys.fileExists,
        'tsconfig.json'
      );
      const tsconfigRaw = ts.readConfigFile(configPath!, ts.sys.readFile);

      const ora = await import('ora');
      const spinner = ora.default({ discardStdin: true, hideCursor: true });
      spinner.start(chalk`{green Building for production...}\n`);

      const userConfig = defineConfig({
        entries: entries.length === 0 ? ['./src/index.ts'] : entries,
        plugins: [options.preset === 'lib' ? libraryPreset() : null]
      });
      const config = await (typeof userConfig === 'function'
        ? userConfig({ command: 'build', mode: options.mode ?? 'production' })
        : userConfig);

      try {
        let buildConfig: InlineConfig = {
          root,
          base: options.base,
          mode: options.mode,
          configFile: options.config,
          logLevel: 'silent',
          clearScreen: options.clearScreen,
          build: buildOptions,
          esbuild: {
            tsconfigRaw: JSON.stringify(tsconfigRaw.config)
          }
        };
        if (!options.config || options.preset) {
          buildConfig = mergeConfig(buildConfig, config) as InlineConfig;
        }

        const watcher = await build(buildConfig);

        if (options.watch && 'on' in watcher) {
          watcher.on('change', (id) => {
            logger.info(chalk`{green hmr update} {dim ${id}}`, {
              clear: false,
              timestamp: true
            });
          });
          watcher.on('event', (event) => {
            switch (event.code) {
              case 'END':
                spinner.info('Build finished, watching for changes...');
                break;
              case 'ERROR':
                spinner.fail(`Error during build:\n${event.error.stack}`);
            }
          });
        } else {
          spinner.succeed('Build finished.');
        }
      } catch (e) {
        const error = e as Error;
        spinner.fail(chalk`Error during build:\n${error.stack}`);
        process.exit(1);
      }
    }
  );

// optimize
cli
  .command('optimize [root]')
  .option('--force', `[boolean] force the optimizer to ignore the cache and re-bundle`)
  .action(async (root: string, options: { force?: boolean } & GlobalCLIOptions) => {
    const { optimizeDeps } = await import('vite');
    if (!options.config) {
      options.config = await findConfig();
    }
    try {
      const config = await resolveConfig(
        {
          root,
          base: options.base,
          configFile: options.config,
          logLevel: options.logLevel
        },
        'build',
        'development'
      );
      await optimizeDeps(config, options.force, true);
    } catch (e) {
      const error = e as Error;
      createLogger(options.logLevel).error(
        chalk.red(`error when optimizing deps:\n${error.stack}`),
        { error }
      );
      process.exit(1);
    }
  });

cli.help();
cli.version(version);

cli.parse();
