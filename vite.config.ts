import { fileURLToPath } from 'node:url';
import { hostname } from 'node:os';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { offlinePlugin } from './build/offline';

const machineHostname = hostname();

export default defineConfig({
  base: './',
  plugins: [react(), offlinePlugin()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [machineHostname, `${machineHostname.replace(/\.local$/, '')}.local`],
    port: 5174,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          pdf: ['pdf-lib'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
      '@service': fileURLToPath(new URL('./src/service', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    css: true,
    include: ['src/**/tests/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
