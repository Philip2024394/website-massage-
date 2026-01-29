// Elite Loading System - Progressive initialization with stage tracking
console.time('⚡ Elite App Boot Time');
console.log('🚀 Starting IndaStreet Elite Loading System...');

// CRITICAL: React 19 AsyncMode fix must be imported FIRST
import './utils/reactCompatibility';

// Priority imports for faster bundle loading
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Progressive loading stages
let loadingProgress = 0;
let currentStage: 'initializing' | 'loading' | 'authenticating' | 'finalizing' = 'initializing';

function updateLoadingProgress(progress: number, stage?: typeof currentStage) {
  loadingProgress = Math.min(progress, 100);
  if (stage) currentStage = stage;
  
  // Update any visible loading indicators
  const eliteLoading = document.querySelector('.elite-loading span');
  if (eliteLoading) {
    const messages = {
      initializing: 'Initializing IndaStreet',
      loading: 'Loading Services',
      authenticating: 'Securing Connection',
      finalizing: 'Almost Ready'
    };
    eliteLoading.textContent = messages[currentStage];
  }
  
  console.log(`⚡ Loading: ${progress}% - ${currentStage}`);
}

// Stage 1: Core React initialization
updateLoadingProgress(15, 'initializing');

// Lazy load heavy components to improve initial bundle size
const App = React.lazy(() => 
  import('./App').then(module => {
    updateLoadingProgress(40, 'loading');
    return module;
  })
);

const ErrorBoundary = React.lazy(() => import('./src/components/ErrorBoundary'));
const AppErrorBoundary = React.lazy(() => import('./src/components/AppErrorBoundary'));

// Stage 2: Service initialization
updateLoadingProgress(25, 'loading');

// Check if running in admin mode
const isAdminMode = import.meta.env.MODE === 'admin';

// Elite loading orchestration
async function initializeApp() {
  try {
    updateLoadingProgress(30, 'loading');
    
    // Admin mode: Redirect to separate admin dashboard app
    if (isAdminMode) {
      console.log('🔐 Redirecting to Admin Dashboard App...');
      window.location.href = 'http://localhost:3004';
      return;
    }
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root container not found');
    }

    const root = ReactDOM.createRoot(container);
    updateLoadingProgress(70, 'authenticating');
    
    // Elite loading wrapper with progress tracking
    const AppWithLoading = () => (
      <React.Suspense 
        fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">IndaStreet</h1>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i}
                    className="w-3 h-3 bg-white rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <p className="text-white/90 mt-4 font-medium">{currentStage}...</p>
              <div className="w-48 bg-white/20 rounded-full h-1 mt-4 mx-auto">
                <div 
                  className="h-1 rounded-full bg-white transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        }
      >
        <React.Suspense fallback={<div>Loading error handlers...</div>}>
          <ErrorBoundary>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </ErrorBoundary>
        </React.Suspense>
      </React.Suspense>
    );

    updateLoadingProgress(85, 'finalizing');
    root.render(<AppWithLoading />);
    
    // Final stage - app mounted
    setTimeout(() => {
      updateLoadingProgress(100, 'finalizing');
      console.timeEnd('⚡ Elite App Boot Time');
      console.log('✅ IndaStreet App Ready - Elite loading complete!');
    }, 200);

  } catch (error) {
    console.error('❌ App initialization failed:', error);
    
    // Fallback error display
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div class="fixed inset-0 flex items-center justify-center bg-red-50">
          <div class="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
            <h2 class="text-2xl font-bold text-red-600 mb-4">Loading Error</h2>
            <p class="text-gray-700 mb-4">IndaStreet is having trouble starting. Please refresh the page.</p>
            <button 
              onclick="window.location.reload()" 
              class="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Start elite loading system
initializeApp();