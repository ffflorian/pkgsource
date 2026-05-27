import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      branches: 80,
      exclude: ['dist/**', 'test/**', 'src/index.ts'],
      functions: 80,
      include: ['src/**/*.ts'],
      lines: 80,
      provider: 'v8',
      reporter: ['text', 'html'],
      statements: 80,
    },
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
