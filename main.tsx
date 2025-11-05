import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

console.log('🚀 main.tsx: Starting React app...');
console.log('🚀 main.tsx: DOM element found:', !!document.getElementById('root'));

// Add global error handler for Chrome DOM manipulation errors
window.addEventListener('error', (event) => {
  // Suppress Chrome-specific DOM manipulation errors during navigation
  if (event.error?.message?.includes('removeChild') || 
      event.error?.message?.includes('The node to be removed is not a child')) {
    console.warn('🔧 Suppressed Chrome DOM manipulation error:', event.error.message);
    event.preventDefault();
    return false;
  }
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('removeChild') || 
      event.reason?.message?.includes('The node to be removed is not a child')) {
    console.warn('🔧 Suppressed Chrome DOM manipulation promise error:', event.reason.message);
    event.preventDefault();
  }
});

const root = document.getElementById('root');
if (!root) {
  console.error('❌ main.tsx: Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">ERROR: Root element not found</div>';
} else {
  console.log('✅ main.tsx: Root element found, mounting React app...');
  
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
  
  console.log('✅ main.tsx: React app mounted successfully');
}