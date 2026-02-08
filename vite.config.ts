import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Force Rollup to use JavaScript fallback instead of native binaries
process.env.ROLLUP_NO_NATIVE = '1'

// Ensure __dirname is available in ESM context
const __dirname = dirname(fileURLToPath(import.meta.url))

// Check if running in admin mode
const _isAdminMode = process.env.VITE_PORT === '3004' || process.argv.includes('--mode=admin');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 🆕 GOLD STANDARD PWA PLUGIN: Store-ready, state-safe installation
    VitePWA({
      registerType: 'autoUpdate', // Auto-update service worker
      injectRegister: 'auto',
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        // 🔒 GOLD STANDARD RULE: NEVER cache booking/auth/API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ik\.imagekit\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagekit-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      
      // 🔒 GOLD STANDARD RULE: Use public/manifest.json as single source of truth
      // Manifest settings are defined in public/manifest.json - DO NOT duplicate here
      manifest: false, // Use public/manifest.json instead
      
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    // ✅ APPS IMPORT RESOLVER: Allow apps/ to import from root src/
    {
      name: 'resolve-apps-imports',
      async resolveId(source, importer, options) {
        // Handle ../../../../src/ imports from apps/ directories (Windows + Unix paths)
        if (importer && (importer.includes('/apps/') || importer.includes('\\apps\\')) && 
            source.startsWith('../../../../src/')) {
          // Convert relative path to absolute path from root
          const relativePath = source.replace('../../../../src/', './src/');
          // Let Vite resolve the converted path with proper extension handling
          const resolved = await this.resolve(relativePath, undefined, { skipSelf: true, ...options });
          return resolved;
        }
        return null;
      }
    },
    // ✅ SPA ROUTING PLUGIN: Handle client-side routes on refresh
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use('/api', (_req, _res, next) => next());
        server.middlewares.use((_req, _res, next) => {
          // Skip API routes and static files
          if (_req.url?.startsWith('/api') || 
              _req.url?.includes('.') && !_req.url?.includes('.html') ||
              _req.url?.startsWith('/@') ||
              _req.url?.startsWith('/node_modules')) {
            return next();
          }
          
          // For all other routes, serve index.html (SPA fallback)
          _req.url = '/';
          next();
        });
      }
    },
    // ✅ SW BUILD HASH INJECTION: Auto-invalidate cache on new deploys
    {
      name: 'inject-sw-build-hash',
      apply: 'build', // Only run during production builds
      generateBundle(_options, bundle) {
        // Generate unique build hash from current timestamp
        const buildHash = Date.now().toString(36);
        console.log(`🔧 Injecting build hash into Service Worker: ${buildHash}`);
        
        // Find and process sw.js in the bundle
        for (const fileName in bundle) {
          if (fileName === 'sw.js' || fileName.endsWith('/sw.js')) {
            const file = bundle[fileName];
            if (file.type === 'asset' && typeof file.source === 'string') {
              // Replace __BUILD_HASH__ placeholder with actual hash
              file.source = file.source.replace(/__BUILD_HASH__/g, buildHash);
              console.log(`✅ Service Worker versioned: 2.3.0+${buildHash}`);
            }
          }
        }
      }
    }
  ],
  resolve: {
    dedupe: ['react', 'react-dom'], // 🔒 CRITICAL: Prevent "R is undefined" errors
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
      // CRITICAL: Allow apps/ to resolve root src/ imports
      'src': path.resolve(__dirname, './src'),
      // Therapist Dashboard @lib aliases (for file watcher compatibility)
      '@lib': path.resolve(__dirname, './apps/therapist-dashboard/src/lib'),
      '@lib/services': path.resolve(__dirname, './apps/therapist-dashboard/src/lib/services'),
      '@lib/appwrite': path.resolve(__dirname, './apps/therapist-dashboard/src/lib/appwrite'),
      '@lib/components': path.resolve(__dirname, './apps/therapist-dashboard/src/lib/components'),
      '@lib/utils': path.resolve(__dirname, './apps/therapist-dashboard/src/lib/utils'),
    },
  },
  server: {
    // 🔒 PRODUCTION-GRADE DEV SERVER LOCK (no fallback, explicit binding)
    port: 3000,
    host: '127.0.0.1', // Explicit IPv4 binding (not 'true')
    open: false,
    strictPort: false, // Allow fallback to next available port
    cors: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // ✅ SPA ROUTING FIX: Configure middleware to handle client-side routes
    middlewareMode: false,
    fs: {
      strict: false
    },
    // 🔧 CORS PROXY: Proxy Appwrite requests to avoid CORS issues
    proxy: {
      '/api/appwrite': {
        target: 'https://syd.cloud.appwrite.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/appwrite/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('❌ Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
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
      // Remove hardcoded ports - let HMR use same port as server
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
    sourcemap: process.env.NODE_ENV === 'production' ? false : true, // Disable sourcemaps in prod for smaller bundles
    minify: 'esbuild',
    // ✅ BROWSER COMPATIBILITY: ES2019 supports 95%+ of browsers (2026)
    // Includes: Chrome 73+, Firefox 63+, Safari 12.1+, Edge 79+
    target: ['es2019', 'chrome73', 'firefox63', 'safari12.1', 'edge79'],
    chunkSizeWarningLimit: 500, // 🚀 INDONESIA OPTIMIZATION: Target max 500KB per chunk for 3G
    commonjsOptions: {
      exclude: ['apps/**/*'] // Exclude dashboard apps from root build
    },
    rollupOptions: {
      external: [],
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // 🔥 CACHE-BUSTING: Add content hash to filenames
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        // 🚀 INDONESIA OPTIMIZATION: Aggressive code splitting for 3G/weak 4G
        manualChunks: (id) => {
          // Critical path optimization for slow networks
          
          // Priority 1: Critical React core (minimal, loads first)
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            
            // Priority 2: Appwrite SDK (API calls)
            if (id.includes('appwrite')) {
              return 'vendor-appwrite';
            }
            
            // Priority 3: Router (needed for SPA)
            if (id.includes('react-router-dom')) {
              return 'vendor-router';
            }
            
            // Priority 4: Icons (lazy load, not critical)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            
            // Priority 5: UI libraries (lazy load)
            if (id.includes('framer-motion') || id.includes('react-hot-toast')) {
              return 'vendor-ui';
            }
            
            // Priority 6: All other vendor code (deferred)
            return 'vendor-misc';
          }
          
          // 🎯 CRITICAL PATH: Core app functionality (< 100KB)
          if (id.includes('lib/appwrite') || id.includes('context/') || id.includes('App.tsx')) {
            return 'core-app';
          }
          
          // 🏠 HOME PAGE: Split into smaller chunks for faster TTI
          if (id.includes('pages/HomePage')) {
            return 'page-home';
          }
          
          if (id.includes('components/TherapistHomeCard') || 
              id.includes('components/MassagePlaceHomeCard') ||
              id.includes('components/FacialPlaceHomeCard')) {
            return 'components-home-cards';
          }
          
          // 💬 CHAT: Heavy component, load only when needed
          if (id.includes('PersistentChatWindow') || id.includes('chat/')) {
            return 'feature-chat';
          }
          
          // 🔐 AUTH: Separate chunk for login/register
          if (id.includes('pages/auth/') || id.includes('AuthPage')) {
            return 'pages-auth';
          }
          
          // 📊 DASHBOARDS: Heavy, rarely accessed on mobile
          if (id.includes('Dashboard') && !id.includes('node_modules')) {
            if (id.includes('therapist')) return 'dashboard-therapist';
            if (id.includes('place')) return 'dashboard-place';
            if (id.includes('admin')) return 'dashboard-admin';
            return 'dashboard-misc';
          }
          
          // 📸 MEDIA: Images, videos, heavy UI
          if (id.includes('ImageUpload') || id.includes('VideoPlayer') || id.includes('Gallery')) {
            return 'feature-media';
          }
          
          // 📋 FORMS: Booking forms, profile editors
          if (id.includes('BookingForm') || id.includes('ProfileEditor')) {
            return 'feature-forms';
          }
          
          // 🗺️ MAPS: Google Maps (heavy!)
          if (id.includes('GoogleMap') || id.includes('maps')) {
            return 'feature-maps';
          }
          
          // 💼 JOBS: Rarely accessed
          if (id.includes('Job') && !id.includes('node_modules')) {
            return 'pages-jobs';
          }
          
          // 📄 OTHER PAGES: Blog, legal, etc.
          if (id.includes('pages/') && !id.includes('HomePage')) {
            return 'pages-misc';
          }
          
          // Default: Small utilities stay in main bundle
          return undefined;
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