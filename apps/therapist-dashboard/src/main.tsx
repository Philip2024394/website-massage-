import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 🔒 APPWRITE COLLECTION PROTECTION - Validates collection IDs at startup
import '../../../lib/appwrite-startup-validator';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
