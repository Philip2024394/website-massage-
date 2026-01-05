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
      '@': resolve(__dirname, '../../'),
      '@shared': resolve(__dirname, '../../lib'),
      '@components': resolve(__dirname, '../../components'),
      '@constants': resolve(__dirname, '../../constants'),
      '@utils': resolve(__dirname, '../../utils'),
      '@types': resolve(__dirname, '../../types'),
      '@services': resolve(__dirname, '../../services')
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
