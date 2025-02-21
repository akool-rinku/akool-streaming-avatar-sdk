import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  globalName: 'AkoolStreamingAvatar',
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
  platform: 'browser',
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
}); 