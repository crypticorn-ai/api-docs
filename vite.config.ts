import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // needed for relative paths if deploying to S3 or CDN
  build: {
    outDir: 'dist',
  },
});