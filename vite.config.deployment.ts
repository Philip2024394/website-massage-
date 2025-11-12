import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Force Rollup to use JavaScript fallback instead of native binaries
process.env.ROLLUP_NO_NATIVE = '1'
// Additional environment variables to force JS fallback
process.env.ROLLUP_NO_WASM = '1'
process.env.NODE_OPTIONS = '--max-old-space-size=4096'

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
    // Force Rollup to use JavaScript fallback
    rollupOptions: {
      // Explicitly disable native binary usage
      external: [],
      output: {
        // Simple chunking strategy to avoid complex Rollup features
        manualChunks: undefined, // Disable manual chunks to simplify build
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