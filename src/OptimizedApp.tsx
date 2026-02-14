import React, { Suspense } from 'react';
import { AppShell, AppShellSkeleton } from './components/AppShell';

/**
 * 🚀 OPTIMIZED APP ENTRY POINT
 *
 * Renders AppShell immediately, then lazy-loads the full App in one chunk.
 * Single React.lazy(import('./App')) avoids "Failed to fetch dynamically imported module"
 * that occurred with the two-stage DeferredApp → import('./App.tsx') flow in dev.
 */

const App = React.lazy(() => import('./App'));

const OptimizedApp: React.FC = () => {
  return (
    <AppShell>
      <Suspense fallback={<AppShellSkeleton />}>
        <App />
      </Suspense>
    </AppShell>
  );
};

export default OptimizedApp;