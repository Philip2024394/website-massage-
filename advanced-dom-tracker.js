// Comprehensive DOM Error Tracker for removeChild Issues
// Copy and paste this entire script into your browser console

console.log('🚀 Advanced DOM Error Tracker v3.0 - Starting...');

// Store original methods
const originalRemoveChild = Node.prototype.removeChild;
const originalAppendChild = Node.prototype.appendChild;
const originalCreateElement = document.createElement;

// Error tracking
let errorCount = 0;
const errorLog = [];
let isTracking = true;

// Component tracking for React
const componentTracker = new Map();

// Enhanced removeChild with detailed tracking
Node.prototype.removeChild = function(child) {
    if (!isTracking) return originalRemoveChild.call(this, child);
    
    const errorId = `error_${++errorCount}`;
    const timestamp = new Date().toISOString();
    
    // Gather comprehensive information
    const errorInfo = {
        id: errorId,
        timestamp,
        parentNode: this,
        childNode: child,
        parentTagName: this.tagName || this.nodeName || 'UNKNOWN',
        childTagName: child.tagName || child.nodeName || 'UNKNOWN',
        parentContainsChild: this.contains(child),
        childParentNode: child.parentNode,
        parentEqualsChildParent: child.parentNode === this,
        parentConnected: this.isConnected,
        childConnected: child.isConnected,
        stackTrace: new Error().stack,
        // React-specific info
        reactFiber: child._reactInternalFiber || child.__reactInternalInstance || null,
        reactProps: child._reactInternalFiber?.memoizedProps || null
    };
    
    // Detect if this is likely to fail
    const willFail = !errorInfo.parentContainsChild || !errorInfo.parentEqualsChildParent;
    
    console.group(`🗑️ removeChild ${errorId} ${willFail ? '⚠️ LIKELY TO FAIL' : '✅'}`);
    console.log('📍 Parent:', this);
    console.log('👶 Child:', child);
    console.log('🔗 Child Parent:', child.parentNode);
    console.log('📊 Analysis:', {
        parentContainsChild: errorInfo.parentContainsChild,
        parentEqualsChildParent: errorInfo.parentEqualsChildParent,
        parentConnected: errorInfo.parentConnected,
        childConnected: errorInfo.childConnected
    });
    
    if (errorInfo.reactFiber) {
        console.log('⚛️ React Component Info:', {
            type: errorInfo.reactFiber.type?.name || errorInfo.reactFiber.type,
            props: errorInfo.reactProps
        });
    }
    
    try {
        const result = originalRemoveChild.call(this, child);
        console.log('✅ removeChild succeeded');
        console.groupEnd();
        return result;
    } catch (error) {
        errorInfo.error = error.message;
        errorInfo.failed = true;
        errorLog.push(errorInfo);
        
        console.error('💥 removeChild FAILED:', error.message);
        console.error('📋 Full error info stored as:', errorId);
        console.trace('📊 Stack trace:');
        console.groupEnd();
        
        // Don't re-throw, just log for now to prevent cascade failures
        console.warn('🛡️ Error suppressed to prevent cascade failures');
        return null;
    }
};

// Track component mounting/unmounting
const originalComponentWillUnmount = React.Component.prototype.componentWillUnmount;
if (originalComponentWillUnmount) {
    React.Component.prototype.componentWillUnmount = function() {
        console.log('🔄 React Component Unmounting:', this.constructor.name);
        return originalComponentWillUnmount.call(this);
    };
}

// Monitor DOM mutations
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    console.log('👀 DOM Node Removed by MutationObserver:', node);
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Error analysis functions
window.analyzeErrors = function() {
    console.group('📊 Error Analysis Report');
    console.log(`Total errors: ${errorLog.length}`);
    
    if (errorLog.length === 0) {
        console.log('✅ No removeChild errors detected!');
        console.groupEnd();
        return { totalErrors: 0, errors: [] };
    }
    
    // Group by error patterns
    const patterns = {};
    errorLog.forEach(error => {
        const pattern = `${error.parentTagName}->${error.childTagName}`;
        if (!patterns[pattern]) patterns[pattern] = [];
        patterns[pattern].push(error);
    });
    
    console.log('🔍 Error Patterns:');
    Object.entries(patterns).forEach(([pattern, errors]) => {
        console.log(`  ${pattern}: ${errors.length} occurrences`);
    });
    
    // Show most recent errors
    const recent = errorLog.slice(-3);
    console.log('📋 Most Recent Errors:', recent);
    
    console.groupEnd();
    return { totalErrors: errorLog.length, patterns, recent };
};

window.getErrorDetails = function(errorId) {
    const error = errorLog.find(e => e.id === errorId);
    if (error) {
        console.log('🔍 Error Details:', error);
        return error;
    } else {
        console.log('❌ Error not found:', errorId);
        return null;
    }
};

window.stopTracking = function() {
    isTracking = false;
    observer.disconnect();
    console.log('🛑 DOM tracking stopped');
};

window.startTracking = function() {
    isTracking = true;
    console.log('▶️ DOM tracking resumed');
};

// Global error handler for uncaught removeChild errors
window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('removeChild')) {
        console.error('🚨 Uncaught removeChild error:', event);
        console.log('📊 Current error log:', errorLog);
    }
});

// Page navigation tracking
let currentPage = location.pathname;
const trackPageChanges = () => {
    if (location.pathname !== currentPage) {
        console.log(`📄 Page changed: ${currentPage} -> ${location.pathname}`);
        currentPage = location.pathname;
    }
};
setInterval(trackPageChanges, 1000);

console.log('✅ Advanced DOM Error Tracker is now active!');
console.log('🎮 Available commands:');
console.log('  - analyzeErrors() - View error summary');
console.log('  - getErrorDetails("error_id") - Get specific error details');
console.log('  - stopTracking() - Pause tracking');
console.log('  - startTracking() - Resume tracking');
console.log('📍 Navigate your app to detect removeChild issues...');