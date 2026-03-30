import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    exclude: ['E2E/**', 'node_modules/**'],
    maxWorkers: 1,
    coverage: {
      reporter: ['json-summary', 'text'],
    },
  },
});
