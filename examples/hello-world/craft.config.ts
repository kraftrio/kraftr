import { dev } from '@kraftr/http-framework';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    lib: {
      entry: './src/app.ts'
    },
    rollupOptions: {
      input: './src/app.ts'
    }
  },
  plugins: [dev({ app: './src/app' })],
  optimizeDeps: {
    exclude: ['sirv']
  }
});
