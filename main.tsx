import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

console.log('🚀 main.tsx: Starting React app...');
console.log('🚀 main.tsx: DOM element found:', !!document.getElementById('root'));

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