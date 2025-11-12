import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Aggressively disable all native binary usage
process.env.ROLLUP_NO_NATIVE = '1'
process.env.ROLLUP_NO_WASM = '1'

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
    sourcemap: false,
    minify: 'esbuild', // Force esbuild minification
    target: 'es2020',
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      // Completely disable any complex Rollup features
      treeshake: 'smallest',
      output: {
        // Force simple output without complex chunking
        manualChunks: () => 'vendor',
        chunkFileNames: '[name].[hash].js',
        entryFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    }
  },
  esbuild: {
    target: 'es2020',
    platform: 'browser'
  },
  // Force to avoid any native optimizations
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  }
})