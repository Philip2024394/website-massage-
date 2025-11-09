import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
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
  server: {
    port: 3000,
    host: true,
    open: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    // Prevent server crashes from file watcher issues
    watch: {
      usePolling: false,
      interval: 100,
      // Ignore large directories that don't need watching
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**',
        '**/*.log',
      ],
    },
    // Increase timeout to prevent connection drops with conservative HMR
    hmr: {
      timeout: 30000,
      overlay: false, // Disable error overlay to prevent conflicts
      port: 24682, // Use different port for HMR to avoid conflicts
    },
    // Graceful shutdown handling
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000, // Increase limit to reduce warnings
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // 🔥 CACHE-BUSTING: Add content hash to filenames
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: (id) => {
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('framer-motion') || id.includes('react-icons') || id.includes('lucide-react')) {
              return 'ui';
            }
            if (id.includes('appwrite')) {
              return 'appwrite';
            }
            if (id.includes('qrcode')) {
              return 'qrcode';
            }
            // Other node_modules go to vendor-misc
            return 'vendor-misc';
          }
          
          // Split analytics service into separate chunk
          if (id.includes('services/analyticsService')) {
            return 'analytics';
          }
          
          // Split commission service into separate chunk
          if (id.includes('services/commissionPaymentService')) {
            return 'commission';
          }
          
          // Split dashboard pages
          if (id.includes('pages/HotelDashboardPage') || 
              id.includes('pages/VillaDashboardPage')) {
            return 'dashboard-hotel-villa';
          }
          
          if (id.includes('pages/TherapistDashboardPage') || 
              id.includes('pages/PlaceDashboardPage')) {
            return 'dashboard-provider';
          }
          
          if (id.includes('pages/AdminDashboardPage') || 
              id.includes('pages/PlatformAnalyticsPage')) {
            return 'dashboard-admin';
          }
          
          if (id.includes('pages/AgentDashboardPage')) {
            return 'dashboard-agent';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Force pre-bundle these to prevent dev server restarts
    force: false,
  },
  // Prevent memory issues during development
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  // Clear screen on restart
  clearScreen: false,
})