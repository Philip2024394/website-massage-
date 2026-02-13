// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { logger } from './utils/logger';

/**
 * 🚀 DEFERRED APP - INSTANT LOADING VERSION
 * 
 * Ultra-fast loading with immediate content display
 * No intermediate loading states, no poor quality screens
 */

// Lazy load the full App.tsx content - but much faster
const loadFullApp = () => import('./App.tsx');

const DeferredApp: React.FC = () => {
  const [FullApp, setFullApp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    const loadTimer = setTimeout(async () => {
      try {
        logger.debug('🚀 DeferredApp: Starting to load full App.tsx...');
        const module = await loadFullApp();
        logger.info('✅ DeferredApp: Full App.tsx loaded successfully');
        setFullApp(() => module.default);
      } catch (error: any) {
        const message = error?.message ?? String(error);
        logger.error('❌ DeferredApp: Failed to load full app:', error);
        setFullApp(() => function LoadErrorScreen() {
          return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center p-4" style={{ backgroundColor: '#f97316' }}>
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Loading Error</h2>
                <p className="text-gray-600 mb-4">Unable to load the application. Please refresh the page.</p>
                {message && (
                  <div className="mb-4 text-left text-sm font-mono bg-gray-100 p-3 rounded overflow-auto max-h-32">
                    <div className="text-red-700 break-words">{message}</div>
                  </div>
                )}
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          );
        });
      }
    }, 100);

    return () => clearTimeout(loadTimer);
  }, []);

  // Show full app if loaded, otherwise return empty fragment for skeleton
  if (FullApp) {
    return <FullApp />;
  }

  // Return empty fragment - keeps #root technically non-empty but visually empty
  // This allows index.html skeleton CSS to remain visible
  return <></>;
};
export default DeferredApp;