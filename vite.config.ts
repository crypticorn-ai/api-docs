import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // needed for relative paths if deploying to S3 or CDN
  build: {
    outDir: 'dist',
    // Work-around for Rollup 4.45 "Cannot add property 0, object is not extensible" bug
    rollupOptions: {
      treeshake: false,
    },
  },
});