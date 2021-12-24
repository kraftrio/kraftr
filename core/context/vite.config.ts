import { libraryPreset, defineConfig } from '@kraftr/build';

export default defineConfig({
  entries: ['src/index.ts', 'src/tests.ts'],
  plugins: libraryPreset(),
  build: {
    sourcemap: false,
    rollupOptions: {
      external: ['vitest']
    }
  }
});
