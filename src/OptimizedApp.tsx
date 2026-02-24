import React, { Suspense } from 'react';
import { AppShell, AppShellSkeleton } from './components/AppShell';

/**
 * 🚀 OPTIMIZED APP ENTRY POINT
 *
 * Renders AppShell immediately, then lazy-loads the full App in one chunk.
 * Retries once on chunk load failure to fix "first visit shows error, reload works" (e.g. CDN/cache timing).
 */

function lazyWithRetry(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  retries = 1
): React.LazyExoticComponent<React.ComponentType<any>> {
  return React.lazy(() =>
    importFn().catch((err) => {
      if (retries <= 0) throw err;
      console.warn('[OptimizedApp] Chunk load failed, retrying once...', err?.message || err);
      return importFn();
    })
  );
}

const App = lazyWithRetry(() => import('./App'));

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