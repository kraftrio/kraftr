import { defineConfig } from '@kraftr/build';
import { dev } from '@kraftr/http-framework';

export default defineConfig({
  entries: ['./src/app'],
  server: {
    port: 3000
  },
  plugins: [dev({ app: './src/app' })],
  optimizeDeps: {
    exclude: ['sirv']
  }
});
