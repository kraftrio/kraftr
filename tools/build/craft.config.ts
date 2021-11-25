import { libraryPreset, defineConfig } from './src/craft/craft';

export default defineConfig({
  entries: ['./src/index.ts', './src/cli.ts', './src/craft/craft.ts'],
  plugins: [libraryPreset()]
});
