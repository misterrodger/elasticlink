import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.types.ts',
        'src/__tests__/fixtures/**',
        'src/__tests__/integration/fixtures/**',
      ],
      thresholds: {
        branches: 95,
        functions: 99,
        lines: 99,
        statements: 99,
      },
    },
  },
});
