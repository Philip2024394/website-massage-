import React from 'react';
import MobileLock from './MobileLock';

// Example usage of MobileLock component
export default function MobileLockExample() {
  return (
    <MobileLock>
      <div className="app-content">
        <header style={{ padding: '20px', background: '#f0f0f0' }}>
          <h1>Mobile Locked App</h1>
          <p>Viewport is stabilized on mobile devices</p>
        </header>
        
        <main style={{ padding: '20px', height: 'calc(100% - 120px)', overflow: 'auto' }}>
          <h2>Scrollable Content</h2>
          <p>This content can scroll while the viewport remains locked.</p>
          
          {/* Generate some scrollable content */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} style={{ padding: '10px', margin: '10px 0', background: '#e9e9e9' }}>
              <h3>Section {i + 1}</h3>
              <p>This is some content that demonstrates scrollable areas within a locked mobile viewport.</p>
            </div>
          ))}
        </main>
        
        <footer style={{ padding: '20px', background: '#f0f0f0', position: 'absolute', bottom: 0, width: '100%' }}>
          <p>Fixed footer - viewport height: {window.innerHeight}px</p>
        </footer>
      </div>
    </MobileLock>
  );
}

// Alternative App.tsx integration example
export function AppWithMobileLock() {
  return (
    <MobileLock>
      <div className="min-h-full bg-white">
        {/* Your existing app content here */}
        <div className="scrollable max-h-full overflow-y-auto">
          {/* Main app routes and components */}
        </div>
      </div>
    </MobileLock>
  );
}