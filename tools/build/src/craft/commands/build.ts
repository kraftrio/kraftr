import chalk from 'chalk';
import { Command, path, string, z } from 'soly';
import { createLogger, InlineConfig, mergeConfig } from 'vite';
import { version } from '../../../package.json';
import { defineConfig } from '../config';
import { stub as stubPlugin } from '../plugins/stub';
import { libraryPreset } from '../presets';
import { findConfig } from '../utils';
const logger = createLogger('info', { prefix: 'craft' });
export function build(cmd: Command) {
  const [entry, ...restEntries] = cmd.positionals(path().optional(), 0, 10);
  const { preset, mode, root, config } = cmd.named({
    preset: z.enum(['lib', 'lib-perf']).default('lib'),
    mode: string().default('production'),
    root: path().default(process.cwd()),
    config: path().optional()
  });

  const { watch, clearScreen, silent, stub } = cmd.flags();
  watch?.alias('w');

  return async () => {
    const configuration = config.value ? config.value : await findConfig();
    const entries = [entry?.value, ...restEntries.map((v) => v.value)].filter(
      Boolean
    ) as string[];

    let presetMsg = '';

    if (!configuration && preset.value) {
      presetMsg = ` [preset: '${preset.value}'] `;
    }

    if (!silent?.value) {
      logger.info(chalk`{cyan craft v${version}${presetMsg}}\n`, {
        clear: false
      });
    }

    const { build } = await import('vite');
    const ora = await import('ora');

    const spinner = ora.default({
      discardStdin: true,
      hideCursor: true,
      isSilent: silent?.value
    });

    spinner.start(chalk`{green Building for production...}\n`);

    let buildConfig: InlineConfig = {
      root: root.value,
      mode: mode.value,
      configFile: configuration,
      logLevel: 'silent',
      clearScreen: clearScreen?.value,
      build: {
        lib: { entry: '' },
        watch: watch?.value === true ? {} : null
      },
      optimizeDeps: {
        exclude: ['rollup-plugin-license']
      }
    };

    if (!config.value || preset.value) {
      const userConfigExport = defineConfig({
        entries,
        plugins: [preset.value === 'lib' ? libraryPreset() : null]
      });

      const localConfig = await (typeof userConfigExport === 'function'
        ? userConfigExport({ command: 'build', mode: mode.value })
        : userConfigExport);

      buildConfig = mergeConfig(buildConfig, localConfig) as InlineConfig;
    }

    if (stub?.value) {
      buildConfig = mergeConfig(buildConfig, <InlineConfig>{ plugins: [stubPlugin()] });
    }

    try {
      const watcher = await build(buildConfig);

      if (watch?.value && 'on' in watcher) {
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
  };
}
