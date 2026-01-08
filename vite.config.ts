import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Force Rollup to use JavaScript fallback instead of native binaries
process.env.ROLLUP_NO_NATIVE = '1'

// Ensure __dirname is available in ESM context
const __dirname = dirname(fileURLToPath(import.meta.url))

// Check if running in admin mode
const isAdminMode = process.env.VITE_PORT === '3004' || process.argv.includes('--mode=admin');

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
      // Additional aliases for cleaner imports (Enterprise standard)
      '@/components': path.resolve(__dirname, './components'),
      '@/pages': path.resolve(__dirname, './pages'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/types': path.resolve(__dirname, './types'),
    },
  },
  server: {
    // 🔒 PRODUCTION-GRADE DEV SERVER LOCK (no fallback, explicit binding)
    port: 3000,
    host: '127.0.0.1', // Explicit IPv4 binding (not 'true')
    open: false,
    strictPort: true, // FAIL FAST if port unavailable (no silent fallback)
    cors: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // 🔧 CORS PROXY: Proxy Appwrite requests to avoid CORS issues
    proxy: {
      '/api/appwrite': {
        target: 'https://syd.cloud.appwrite.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/appwrite/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to:', proxyReq.path);
          });
        }
      }
    },
    // Facebook-standard file watching - WINDOWS OPTIMIZED
    watch: {
      usePolling: true, // REQUIRED for Windows reliability
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
    // Facebook-standard HMR - instant updates
    hmr: {
      overlay: true,
      host: '127.0.0.1',
      port: 3000,
      clientPort: 3000,
    },
  },
  // Ensure preview also uses a low, predictable port
  preview: {
    port: 4000,
    host: true,
    open: true,
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production builds
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: [],
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html')
      },
      output: {
        // 🔥 CACHE-BUSTING: Add content hash to filenames
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: (id) => {
          // Split vendor chunks for better caching (Facebook/Amazon style)
          if (id.includes('node_modules')) {
            // Critical: React core (< 150KB)
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Routing (< 50KB)
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // UI Libraries (< 200KB)
            if (id.includes('framer-motion') || id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Appwrite SDK (< 100KB)
            if (id.includes('appwrite')) {
              return 'vendor-appwrite';
            }
            // Form libraries (< 50KB)
            if (id.includes('react-hook-form') || id.includes('react-hot-toast')) {
              return 'vendor-forms';
            }
            // QR Code (< 30KB)
            if (id.includes('qrcode')) {
              return 'vendor-qr';
            }
            // Date utilities (< 50KB)
            if (id.includes('date-fns')) {
              return 'vendor-dates';
            }
            // All other node_modules
            return 'vendor-misc';
          }
          
          // Business Logic Services (Industry Standard: < 30KB per chunk)
          if (id.includes('lib/appwriteService') || id.includes('lib/services')) {
            return 'services-core';
          }
          
          // Split large pages into separate chunks
          if (id.includes('pages/PlaceDashboardPage')) {
            return 'page-place-dashboard';
          }
          if (id.includes('pages/EmployerJobPostingPage')) {
            return 'page-job-posting';
          }
          if (id.includes('pages/ConfirmTherapistsPage')) {
            return 'page-confirm-therapists';
          }
          if (id.includes('pages/LiveAdminDashboardEnhanced')) {
            return 'page-admin-dashboard';
          }
          
          // Grouping smaller dashboards
          if (id.includes('pages/') && id.includes('Dashboard')) {
            return 'pages-dashboards';
          }
          
          // Public marketing pages
          if (id.includes('pages/HomePage') || 
              id.includes('pages/LandingPage') ||
              id.includes('pages/AboutUsPage')) {
            return 'pages-public';
          }
          
          // Job/employment related pages
          if (id.includes('pages/') && (id.includes('Job') || id.includes('Jobs'))) {
            return 'pages-jobs';
          }
          
          // Authentication pages
          if (id.includes('pages/') && (id.includes('Login') || id.includes('Auth') || id.includes('Register'))) {
            return 'pages-auth';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'react-hot-toast',
      'framer-motion',
    ],
    exclude: ['appwrite'],
    force: false,
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Prevent memory issues during development (Enterprise optimization)
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Drop console/debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  clearScreen: false,
  logLevel: 'info',
  appType: 'spa',
})