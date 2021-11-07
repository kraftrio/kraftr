import { Plugin } from 'vite';
import chalk from 'chalk';
export type VitePluginKraftrConfig = {
  path?: string;
};

export function VitePluginKraftr(config?: VitePluginKraftrConfig): Plugin {
  const basePath = config?.path ?? './src/app.ts';
  return {
    apply: 'serve',
    name: 'vite-plugin-kraftr',
    config: () => ({
      server: {
        hmr: false,
        watch: {
          ignored: ['./dist']
        }
      }
    }),
    configureServer({
      watcher,
      printUrls,
      middlewares,
      ssrLoadModule,
      config: { logger }
    }) {
      let app: any;
      watcher.once('ready', async () => {
        app = (await ssrLoadModule(basePath))['default'];
        if (!app) {
          logger.error(`Failed to find the default export from ${basePath}`);
          // eslint-disable-next-line unicorn/no-process-exit
          process.exit(1);
        }
        app.start();
      });
      watcher.on('all', async (evnt) => {
        if (['add', 'addDir', 'change', 'unlink', 'unlinkDir'].includes(evnt)) {
          app = (await ssrLoadModule(basePath))['default'];
          if (!app) {
            logger.error(`Failed to find the default export from ${basePath}`);
            // eslint-disable-next-line unicorn/no-process-exit
            process.exit(1);
          }
          app.restart();
          logger.info(
            // eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
            chalk.cyan(`\n  vite v${require('vite/package.json').version}`) +
              chalk.green(` dev server running at:\n`),
            {
              clear: true
            }
          );

          printUrls();
        }
      });

      middlewares.use((req, res) => app.middleware(req, res));
    }
  };
}
