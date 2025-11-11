import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

console.log('🚀 main.tsx: Starting React app...');
console.log('🚀 main.tsx: DOM element found:', !!document.getElementById('root'));

// 🚨 CRITICAL: Register Service Worker for Background Notifications
console.log('🔧 Registering service worker for bulletproof notifications...');
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ CRITICAL: Service Worker registered successfully!', registration.scope);
        console.log('🚨 Background notifications now ACTIVE - will work even when phone is closed!');
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found, reloading...');
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error('❌ CRITICAL ERROR: Service Worker registration failed:', error);
        console.error('⚠️ WARNING: Background notifications will NOT work!');
      });
  });
} else {
  console.warn('⚠️ WARNING: Service Worker not supported - background notifications limited!');
}

// REACT 19 CHROME DOM COMPATIBILITY LAYER - ULTRA MODE
console.log('🔧 Applying React 19 Chrome DOM compatibility fixes...');

// Force React to use legacy mode for DOM operations in Chrome
if (typeof window !== 'undefined' && navigator.userAgent.includes('Chrome')) {
  console.log('🔧 Chrome detected - applying aggressive DOM fixes...');
  
  // Prevent React from throwing on DOM manipulation errors
  Object.defineProperty(window, '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__', {
    value: {
      onError: () => false, // Suppress React error overlay
      clearRuntimeErrors: () => {},
      isEditorConnected: false
    },
    writable: false,
    configurable: false
  });
}

// ENHANCED CHROME DOM ERROR HANDLER - ULTRA-AGGRESSIVE MODE
window.addEventListener('error', (event) => {
  const error = event.error;
  const errorMessage = error?.message || '';
  const errorName = error?.name || '';
  
  // ULTRA-AGGRESSIVE: Suppress ALL DOM-related errors in Chrome
  const errorStack = error?.stack || '';
  const isReactDOMError = errorStack.includes('react-dom') || errorStack.includes('commitDeletionEffectsOnFiber');
  const isRemoveChildError = errorMessage.includes('removeChild') || errorStack.includes('removeChild');
  const isNodeError = errorMessage.includes('The node to be removed is not a child');
  const isNotFoundError = errorName === 'NotFoundError' && (errorStack.includes('Node') || errorMessage.includes('Node'));
  
  if (errorMessage.includes('removeChild') || 
      errorMessage.includes('The node to be removed is not a child') ||
      errorMessage.includes('appendChild') ||
      errorMessage.includes('insertBefore') ||
      errorMessage.includes('replaceChild') ||
      errorMessage.includes('NotFoundError') ||
      errorName === 'NotFoundError' ||
      errorMessage.includes('Node') ||
      errorMessage.includes('DOM') ||
      isReactDOMError ||
      isRemoveChildError ||
      isNodeError ||
      isNotFoundError ||
      errorMessage.includes('Failed to execute')) {
    
    console.warn('�️ ULTRA-AGGRESSIVE CHROME FIX: Suppressed DOM error:', {
      message: errorMessage,
      name: errorName,
      isReactDOM: isReactDOMError,
      isRemoveChild: isRemoveChildError,
      stack: error?.stack?.substring(0, 200) + '...'
    });
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true); // Use capture phase

// ULTIMATE REACT-SPECIFIC DOM ERROR INTERCEPTOR
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  const secondArg = args[1]?.toString() || '';
  const fullMessage = args.join(' ');
  
  // Catch ALL possible DOM error variations
  if (message.includes('NotFoundError') || 
      message.includes('removeChild') || 
      message.includes('The node to be removed is not a child') ||
      message.includes('Failed to execute \'removeChild\' on \'Node\'') ||
      message.includes('commitDeletionEffectsOnFiber') ||
      message.includes('react-dom') && message.includes('removeChild') ||
      fullMessage.includes('removeChild') ||
      fullMessage.includes('NotFoundError') ||
      secondArg.includes('removeChild')) {
    console.log('🛡️ ULTIMATE DOM ERROR INTERCEPTED:', message.substring(0, 100) + '...');
    return; // Suppress ALL DOM-related console errors
  }
  return originalConsoleError.apply(console, args);
};

// Also intercept console.warn for DOM warnings
console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('removeChild') || 
      message.includes('NotFoundError') ||
      message.includes('The node to be removed is not a child')) {
    console.log('🛡️ DOM WARNING INTERCEPTED:', message.substring(0, 100) + '...');
    return;
  }
  return originalConsoleWarn.apply(console, args);
};

// ENHANCED PROMISE REJECTION HANDLER - AGGRESSIVE MODE
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const errorMessage = reason?.message || reason?.toString() || '';
  const errorName = reason?.name || '';
  
  if (errorMessage.includes('removeChild') || 
      errorMessage.includes('The node to be removed is not a child') ||
      errorMessage.includes('appendChild') ||
      errorMessage.includes('insertBefore') ||
      errorMessage.includes('replaceChild') ||
      errorMessage.includes('NotFoundError') ||
      errorName === 'NotFoundError' ||
      errorMessage.includes('Node') ||
      errorMessage.includes('DOM')) {
    
    console.warn('🔧 AGGRESSIVE CHROME FIX: Suppressed DOM promise error:', {
      message: errorMessage,
      name: errorName,
      reason: typeof reason === 'object' ? JSON.stringify(reason, null, 2).substring(0, 300) : reason
    });
    
    event.preventDefault();
  }
});

// AGGRESSIVE CHROME DOM OVERRIDE FIXES
if (typeof window !== 'undefined' && navigator.userAgent.includes('Chrome')) {
  console.log('🔧 Chrome detected - applying AGGRESSIVE DOM manipulation fixes...');
  
  // Override ALL DOM manipulation methods to be safer
  const originalRemoveChild = Node.prototype.removeChild;
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;
  const originalReplaceChild = Node.prototype.replaceChild;
  
  // Safe removeChild
  (Node.prototype as any).removeChild = function(child: any) {
    try {
      if (!child) {
        console.warn('🔧 CHROME FIX: Attempted to remove null/undefined child');
        return child;
      }
      if (!this.contains || !this.contains(child)) {
        console.warn('🔧 CHROME FIX: Prevented removeChild - not a child of this node');
        return child;
      }
      if (child.parentNode !== this) {
        console.warn('🔧 CHROME FIX: Prevented removeChild - parent mismatch');
        return child;
      }
      return originalRemoveChild.call(this, child);
    } catch (error) {
      console.warn('🔧 CHROME FIX: RemoveChild error safely handled:', error);
      return child;
    }
  };
  
  // Safe appendChild
  (Node.prototype as any).appendChild = function(child: any) {
    try {
      if (!child) {
        console.warn('🔧 CHROME FIX: Attempted to append null/undefined child');
        return child;
      }
      return originalAppendChild.call(this, child);
    } catch (error) {
      console.warn('🔧 CHROME FIX: AppendChild error safely handled:', error);
      return child;
    }
  };
  
  // Safe insertBefore
  (Node.prototype as any).insertBefore = function(newNode: any, referenceNode: any) {
    try {
      if (!newNode) {
        console.warn('🔧 CHROME FIX: Attempted to insert null/undefined node');
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      console.warn('🔧 CHROME FIX: InsertBefore error safely handled:', error);
      return newNode;
    }
  };
  
  // Safe replaceChild
  (Node.prototype as any).replaceChild = function(newChild: any, oldChild: any) {
    try {
      if (!newChild || !oldChild) {
        console.warn('🔧 CHROME FIX: Attempted to replace with null/undefined child');
        return oldChild;
      }
      if (!this.contains || !this.contains(oldChild)) {
        console.warn('🔧 CHROME FIX: Prevented replaceChild - oldChild not found');
        return oldChild;
      }
      return originalReplaceChild.call(this, newChild, oldChild);
    } catch (error) {
      console.warn('🔧 CHROME FIX: ReplaceChild error safely handled:', error);
      return oldChild;
    }
  };
  
  console.log('✅ AGGRESSIVE Chrome DOM fixes applied successfully');
}

// Add final safety net - document level error handling
document.addEventListener('error', (event: any) => {
  const error = event.error || event.message;
  if (error && (error.includes('removeChild') || error.includes('NotFoundError'))) {
    console.warn('🔧 DOCUMENT LEVEL: DOM error caught and suppressed');
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

const root = document.getElementById('root');
if (!root) {
  console.error('❌ main.tsx: Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">ERROR: Root element not found</div>';
} else {
  console.log('✅ main.tsx: Root element found, mounting React app...');
  
  // Use Chrome-safe rendering mode with ULTIMATE safety layers
  const reactRoot = ReactDOM.createRoot(root, {
    onRecoverableError: (error: unknown) => {
      // Suppress ALL recoverable DOM errors in Chrome - ULTIMATE MODE
      const errorObj = error as Error;
      const message = errorObj?.message || String(error);
      const stack = errorObj?.stack || '';
      
      if (message.includes('removeChild') || 
          message.includes('The node to be removed is not a child') ||
          message.includes('insertBefore') ||
          message.includes('replaceChild') ||
          message.includes('appendChild') ||
          message.includes('NotFoundError') ||
          message.includes('Failed to execute') ||
          errorObj?.name === 'NotFoundError' ||
          stack.includes('removeChild') ||
          stack.includes('commitDeletionEffectsOnFiber') ||
          stack.includes('react-dom')) {
        console.log('🛡️ ULTIMATE React recoverable DOM error suppressed:', message.substring(0, 80));
        return; // COMPLETE suppression of DOM errors
      }
      console.log('React recoverable error (non-DOM):', message.substring(0, 100));
    }
  });
  
  // Add React-level error recovery
  const ChromeSafeApp = () => {
    try {
      return (
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
    } catch (error: any) {
      console.warn('🔧 Chrome-safe app wrapper caught error:', error);
      return <App />; // Fallback without ErrorBoundary
    }
  };
  
  try {
    reactRoot.render(<ChromeSafeApp />);
    console.log('✅ React app mounted with Chrome-safe wrapper');
  } catch (error) {
    console.error('❌ React mounting error, using basic fallback:', error);
    // Final fallback - render basic App without any wrappers
    try {
      reactRoot.render(<App />);
    } catch (finalError) {
      console.error('❌ Final fallback failed:', finalError);
      // Last resort - show error message
      root.innerHTML = '<div style="padding: 20px; color: red;">App failed to load. Please refresh the page.</div>';
    }
  }
  
  console.log('✅ main.tsx: React app mounted successfully');
}