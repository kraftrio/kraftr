import chalk from 'chalk';
import { Command, number, path, string, z } from 'soly';
import { createLogger } from 'vite';
import { findConfig } from '../utils';

export function run(cmd: Command) {
  const [entry] = cmd.positionals([path().default('./src/index.ts')]);

  const { preset, port, mode, root, config, logLevel } = cmd.named({
    preset: z.enum(['lib', 'lib-perf']).default('lib'),
    mode: string().default('production'),
    root: path().default(process.cwd()),
    port: number().optional(),
    logLevel: z.enum(['info', 'silent', 'error', 'warn']).default('info'),
    config: path().optional()
  });

  const { clearScreen } = cmd.flags();

  return async () => {
    const configuration = config.value ? config.value : await findConfig();

    const { createServer } = await import('vite');

    try {
      const server = await createServer({
        root: root.value,
        mode: mode.value,
        configFile: configuration,
        clearScreen: clearScreen?.value,
        logLevel: logLevel.value,
        build: {
          lib: { entry: '' }
        },
        optimizeDeps: {
          exclude: ['rollup-plugin-license']
        },
        server: {
          port: port.value
        }
      });

      await server.pluginContainer.buildStart({});

      await server.ssrLoadModule(entry.value);

      await server.close();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      createLogger(logLevel.value).error(
        chalk.red(`error when starting dev server:\n${error.stack}`),
        { error }
      );
      process.exit(1);
    }
  };
}
