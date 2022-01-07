import { defineConfig } from '@kraftr/build';
import { dev } from '@kraftr/http-framework';

export default defineConfig({
  entries: ['./src/index.ts'],
  server: {
    port: 3000
  },
  plugins: [dev({ app: './src/app' })],
  optimizeDeps: {
    exclude: ['sirv']
  }
});
