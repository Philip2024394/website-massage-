import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Deployment configuration optimized for Appwrite
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/apps': path.resolve(__dirname, './src/apps'),
      '@/admin': path.resolve(__dirname, './src/apps/admin'),
      '@/agent': path.resolve(__dirname, './src/apps/agent'),
      '@/client': path.resolve(__dirname, './src/apps/client'),
      '@/therapist': path.resolve(__dirname, './src/apps/therapist'),
      '@/place': path.resolve(__dirname, './src/apps/place'),
      '@/hotel': path.resolve(__dirname, './src/apps/hotel'),
      '@/villa': path.resolve(__dirname, './src/apps/villa'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for deployment
    minify: 'esbuild', // Use esbuild instead of Rollup for minification
    target: 'es2020',
    chunkSizeWarningLimit: 3000, // Increase limit for deployment
    // Minimal rollup config to avoid native binary issues
    rollupOptions: {
      output: {
        // Simple chunking strategy
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('pages/')) {
            return 'pages';
          }
          if (id.includes('components/')) {
            return 'components';
          }
        },
      },
    },
  },
  esbuild: {
    // Force esbuild to handle the build process
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
})