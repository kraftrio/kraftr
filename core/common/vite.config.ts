import { defineConfig, libraryPreset } from '@kraftr/build';

export default defineConfig({
  entries: ['src/index.ts'],
  plugins: libraryPreset()
});
