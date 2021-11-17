import chalk from 'chalk';
import execa from 'execa';
import path from 'node:path';
import { Plugin } from 'vite';
import type { Ora } from 'ora';
import { builtinModules } from 'node:module';
import { loadPackageJSON } from 'local-pkg';

export type InstallerPluginConfig = {
  cwd?: string;
  dev?: boolean;
  silent?: boolean;
  packageManager?: PackageManager;
  preferOffline?: boolean;
  additionalArgs?: string[];
};

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'rush';

const LOCKS: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  '.rush': 'rush'
};

async function detectPackageManager(cwd: string) {
  const { findUp, pathExists } = await import('find-up');
  const keys = Object.keys(LOCKS);
  const result = await findUp(
    async (directory) => {
      for (const key of keys) {
        if (await pathExists(path.join(directory, key))) {
          return key;
        }
      }
    },
    { type: 'directory', cwd }
  );

  return result ? LOCKS[path.basename(result)]! : 'npm';
}

function buildCommand(agent: PackageManager, isDev: boolean) {
  switch (agent) {
    case 'yarn':
      return ['add', isDev ? '-D' : ''];
    case 'npm':
    case 'pnpm':
      return ['install', isDev ? '-D' : ''];
    case 'rush':
      return ['add', isDev ? '--dev' : '', '-p'];
  }
}

let pending: Promise<void> | undefined;
let detectedAgent: PackageManager;
const tasks: Record<string, typeof pending> = {};

export async function installPackage(name: string, options: InstallerPluginConfig = {}) {
  if (!detectedAgent) {
    detectedAgent = await detectPackageManager(options.cwd ?? process.cwd());
  }
  if (pending) await pending;
  if (tasks[name]) return tasks[name];

  const agent = options.packageManager ?? detectedAgent;

  const args = options.additionalArgs || [];

  if (options.preferOffline && agent !== 'rush') args.unshift('--prefer-offline');

  const commands = buildCommand(agent, options.dev ?? false).concat([name], args);

  tasks[name] = pending = execa(agent, commands.filter(Boolean), {
    stdio: options.silent ? 'ignore' : 'inherit',
    cwd: options.cwd
  })
    .then(() => {})
    .finally(() => (pending = undefined));

  return tasks[name];
}

/**
 * @public
 * @param config - available for this plugin
 * @returns rollup plugin to externalize dependencies
 */
export function installer(config?: InstallerPluginConfig): Plugin {
  let spinner: Ora;
  const installed = new Set([
    ...builtinModules,
    ...builtinModules.map((builtin) => `node:${builtin}`)
  ]);
  let pkg: Partial<typeof import('../../../package.json')>;
  let isInstalledAny = false;

  const loadDeps = async () => {
    const ora = await import('ora');
    spinner = ora.default();
    pkg = (await loadPackageJSON()) as typeof pkg;

    Object.keys(pkg.dependencies ?? {})
      .concat(Object.keys(pkg.devDependencies ?? {}))
      .forEach((v) => installed.add(v));
  };

  return {
    name: 'auto-installer',
    async resolveId(importee, importer) {
      // entry module
      if (!importer) return null;
      if (!spinner && !pkg) await loadDeps();

      // this function doesn't actually resolve anything, but it provides us with a hook to discover uninstalled deps

      const isExternalPackage =
        importee[0] !== '.' && importee[0] !== '\0' && !path.isAbsolute(importee);

      if (isExternalPackage && !installed.has(importee) && !tasks[importee]) {
        if (!isInstalledAny) {
          spinner.info(`Found missing dependencies: `);
          isInstalledAny = true;
        }
        spinner.start(chalk`Installing: {cyan ${importee}}`);
        try {
          await installPackage(importee, {
            silent: true,
            preferOffline: true,
            ...config
          });
          spinner.succeed(chalk`Installed: {cyan ${importee}}`);
        } catch (error) {
          spinner.fail(chalk`Not installed {cyan ${importee}}`);
        }
      }
      return null;
    }
  };
}
