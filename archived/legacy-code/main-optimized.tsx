// Elite Loading System - Progressive initialization with stage tracking
console.time('⚡ Elite App Boot Time');
console.log('🚀 Starting IndaStreet Elite Loading System...');

// CRITICAL: React 19 AsyncMode fix must be imported FIRST
import './src/utils/reactCompatibility';

// Priority imports for faster bundle loading
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import error boundaries directly (not lazy) to avoid Suspense issues
import ErrorBoundary from './src/components/ErrorBoundary';
import AppErrorBoundary from './src/components/AppErrorBoundary';

// Progressive loading stages
let loadingProgress = 0;
let currentStage: 'initializing' | 'loading' | 'authenticating' | 'finalizing' = 'initializing';

function updateLoadingProgress(progress: number, stage?: typeof currentStage) {
  loadingProgress = Math.min(progress, 100);
  if (stage) currentStage = stage;
  
  console.log(`⚡ Loading: ${progress}% - ${currentStage}`);
}

// Stage 1: Core React initialization
updateLoadingProgress(15, 'initializing');

// Lazy load only the main App component
const App = React.lazy(() => 
  import('./App').then(module => {
    updateLoadingProgress(60, 'loading');
    return module;
  })
);

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
      <ErrorBoundary>
        <AppErrorBoundary>
          <React.Suspense 
            fallback={
              <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
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
                </div>
              </div>
            }
          >
            <App />
          </React.Suspense>
        </AppErrorBoundary>
      </ErrorBoundary>
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