import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  plugins: [react()],
});
