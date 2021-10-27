#!/usr/bin/env node

const { resolve } = require('path');
const vite = require('vite');
const chalk = require('chalk');

async function run() {
  if (process.argv.includes('build')) {
    await vite.build({
      configFile: resolve(__dirname, '../vite.config.ts')
    });
  } else {
    const server = await vite.createServer({
      configFile: resolve(__dirname, '../vite.config.ts')
    });
    await server.listen();
    const info = server.config.logger.info;

    info(
      chalk.cyan(`\n  vite v${require('vite/package.json').version}`) +
        chalk.green(` dev server running at:\n`),
      {
        clear: !server.config.logger.hasWarned
      }
    );

    server.printUrls();
  }
}

run();
