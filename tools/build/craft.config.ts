import { libraryPreset, defineConfig } from './src/craft';

export default defineConfig({
  entries: ['./src/index.ts', './src/cli.ts'],
  plugins: [libraryPreset()]
});
