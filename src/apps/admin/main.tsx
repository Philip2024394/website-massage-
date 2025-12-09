import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import '../../../index.css'; // Use same global styles

console.log('🚀 Admin App Entry Point: Initializing...');

// Initialize admin app
ReactDOM.createRoot(document.getElementById('admin-root')!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);

console.log('✅ Admin App: Mounted successfully');
