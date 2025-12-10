import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
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
      '@services': resolve(__dirname, '../../services'),
      '@constants': resolve(__dirname, '../../constants'),
      '@utils': resolve(__dirname, '../../utils'),
      '@types': resolve(__dirname, '../../types')
    }
  },
  server: {
    port: 3004,
    strictPort: true
  }
});
