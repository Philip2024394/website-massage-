import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ⚠️ STANDALONE THERAPIST DASHBOARD DISABLED
// Therapist dashboard ONLY accessible through main website integration
// Use: pnpm dev (main website) then login as therapist
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    // Disabled - should not run standalone
    open: false
  },
  resolve: {
    alias: {
      // Root lib folder - PRIMARY APPROACH
      '@lib': path.resolve(__dirname, 'src/lib'),

      // Subfolders for clarity
      '@lib/services': path.resolve(__dirname, 'src/lib/services'),
      '@lib/appwrite': path.resolve(__dirname, 'src/lib/appwrite'),
      '@lib/components': path.resolve(__dirname, 'src/lib/components'),
      '@lib/utils': path.resolve(__dirname, 'src/lib/utils'),

      // Essential cross-package imports (minimal set)
      '@context': path.resolve(__dirname, '../../src/context'),
      '@components': path.resolve(__dirname, '../../src/components'),
      '@hooks': path.resolve(__dirname, '../../src/hooks'),
      '@utils': path.resolve(__dirname, '../../src/utils'),
      '@types': path.resolve(__dirname, '../../src/types'),
    },
  },
});
