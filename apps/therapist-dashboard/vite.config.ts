import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/therapist/' : '/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@shared': resolve(__dirname, '../../lib'),
      '@components': resolve(__dirname, '../../src/components'),
      '@constants': resolve(__dirname, '../../src/constants'),
      '@utils': resolve(__dirname, '../../src/utils'),
      '@types': resolve(__dirname, '../../src/types'),
      '@services': resolve(__dirname, '../../src/services'),
      '@chat': resolve(__dirname, '../../src/chat'),
      '@context': resolve(__dirname, '../../src/context'),
      '@hooks': resolve(__dirname, '../../src/hooks')
    }
  },
  server: {
    port: 3003,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3003
    }
  }
});
