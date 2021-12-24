import { libraryPreset, defineConfig } from './src/craft';

export default defineConfig({
  entries: ['./src/index.ts', './src/craft/cli.ts'],
  plugins: [libraryPreset()]
});
