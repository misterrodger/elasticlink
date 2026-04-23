import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  fixedExtension: false,
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  target: 'node20',
  deps: {
    neverBundle: ['@elastic/elasticsearch'],
  },
});
