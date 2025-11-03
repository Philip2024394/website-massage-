import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SimpleApp />
    </ErrorBoundary>
  </React.StrictMode>,
);