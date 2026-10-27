import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve('.'), ['BASE_URL', 'TUNER']);
  return {
    base: env.BASE_URL || './',
    define: {
      'import.meta.env.TUNER': JSON.stringify(env.TUNER === 'true'),
    },
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
    plugins: [react()],
  };
});
