import { createCLI } from 'soly';
import { loadConfigFromFile, PluginOption, UserConfig } from 'vite';
import { build, stub, test } from './commands';
import { CraftConfig, CraftPluginOption } from '.';
import { findConfig } from './utils';

const cli = createCLI('craft');

function pluginWithCommands(
  plugin: CraftPluginOption | PluginOption
): plugin is CraftPluginOption {
  return !!plugin && typeof plugin === 'object' && 'commands' in plugin;
}

function filterPluginWithCommands(
  config?: UserConfig | CraftConfig
): CraftPluginOption[] {
  if (!config?.plugins) return [];

  return config.plugins.flat().filter(pluginWithCommands);
}
const CraftPlugin: CraftPluginOption = {
  name: 'craft-default-plugin',
  commands: {
    build,
    stub,
    test
  }
};

async function main() {
  const configPath = await findConfig();
  const config = await loadConfigFromFile(
    { command: 'build', mode: '' },
    configPath
  ).then((options) => options?.config);

  const plugins = filterPluginWithCommands(config);
  for (const plugin of [...plugins, CraftPlugin]) {
    if (!plugin || !plugin.commands) continue;

    Object.entries(plugin.commands).forEach(([cmdName, fn]) => cli.command(cmdName, fn));
  }

  cli.parse(process.argv.slice(2));
}

main().then().catch();
