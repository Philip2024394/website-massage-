
import React from 'react';
import ReactDOM from 'react-dom/client';
// Force cache bust: 2024-10-31-10:15:00
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
