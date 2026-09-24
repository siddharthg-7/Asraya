import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@pramana/shared': path.resolve(__dirname, 'shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    env: {
      BBS_SIGNATURES_MODE: 'WASM',
    },
    include: ['tests/**/*.test.ts', 'backend/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/'],
    },
  },
});
