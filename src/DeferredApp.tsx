// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

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
    // Load full app with proper error handling
    const loadTimer = setTimeout(async () => {
      try {
        console.log('🚀 DeferredApp: Starting to load full App.tsx...');
        const module = await loadFullApp();
        console.log('✅ DeferredApp: Full App.tsx loaded successfully');
        setFullApp(() => module.default);
      } catch (error) {
        console.error('❌ DeferredApp: Failed to load full app:', error);
        // Show error instead of reloading to prevent infinite reload loop
        setFullApp(() => () => (
          <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center p-4" style={{ backgroundColor: '#f97316' }}>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Loading Error</h2>
              <p className="text-gray-600 mb-4">Unable to load the application. Please refresh the page.</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ));
      }
    }, 100); // Slightly longer delay for better error handling

    return () => clearTimeout(loadTimer);
  }, []);

  // Show full app if loaded, otherwise show minimal loader
  if (FullApp) {
    return <FullApp />;
  }

  // MINIMAL LOADING STATE - No intermediate content
  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
      <Helmet>
        <title>IndaStreet - Loading...</title>
      </Helmet>
      
      {/* Simple loading spinner */}
      <div className="text-center">
        <div className="mb-4">
          <div className="text-3xl font-bold">
            <span className="text-white">Inda</span>
            <span className="text-white">Street</span>
          </div>
        </div>
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default DeferredApp;