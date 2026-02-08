// Page State Diagnostic Script
// Paste this into browser console to debug loading loop

console.log('🔍 [PAGE DIAGNOSTIC] Starting page state analysis...');

// Check React DevTools state
const checkReactState = () => {
    // Look for React components
    const reactRoot = document.querySelector('#root, [data-reactroot]');
    if (!reactRoot) {
        console.error('❌ React root not found');
        return false;
    }
    
    console.log('✅ React root found:', reactRoot);
    return true;
};

// Check current URL and routing
const checkRouting = () => {
    console.log('🔗 Current URL:', window.location.href);
    console.log('🔗 Pathname:', window.location.pathname);
    console.log('🔗 Hash:', window.location.hash);
    console.log('🔗 Search:', window.location.search);
};

// Check for stuck loading indicators
const checkLoadingIndicators = () => {
    const loadingElements = document.querySelectorAll('[data-loading-state], .loading, #react-loading-spinner');
    console.log('🔄 Loading indicators found:', loadingElements.length);
    
    Array.from(loadingElements).forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        console.log(`📊 Loading element ${i + 1}:`, {
            tag: el.tagName,
            id: el.id,
            classes: el.className,
            visible: rect.width > 0 && rect.height > 0,
            position: `${rect.x}, ${rect.y}`,
            size: `${rect.width}x${rect.height}`,
            zIndex: window.getComputedStyle(el).zIndex,
            background: window.getComputedStyle(el).background
        });
    });
    
    return loadingElements;
};

// Check console for errors
const checkConsoleErrors = () => {
    console.log('📝 Checking for console errors...');
    // Enable error tracking if not already done
    if (!window.__errorCount) {
        window.__errorCount = 0;
        const originalError = console.error;
        console.error = (...args) => {
            window.__errorCount++;
            console.log(`🚨 Error #${window.__errorCount}:`, ...args);
            originalError.apply(console, args);
        };
    }
    console.log(`📊 Total errors detected: ${window.__errorCount || 0}`);
};

// Force navigation to home page
window.forceNavigateHome = () => {
    console.log('🏠 [MANUAL] Force navigating to home...');
    
    // Try multiple approaches
    try {
        // Approach 1: Direct hash navigation
        window.location.hash = '#/home';
        
        // Approach 2: Clear and reload
        setTimeout(() => {
            window.location.href = window.location.origin + '/#/home';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Force navigation failed:', error);
        
        // Fallback: full page reload
        window.location.reload();
    }
};

// Clear all loading states
window.emergencyClear = () => {
    console.log('🆘 [EMERGENCY] Clearing all loading states...');
    
    // Hide all loading elements
    document.querySelectorAll('[data-loading-state], .loading, #react-loading-spinner').forEach(el => {
        el.style.display = 'none';
        console.log('🗑️ Hidden:', el.tagName, el.id || el.className);
    });
    
    // Trigger timeout events
    window.dispatchEvent(new CustomEvent('loadingTimeout', { detail: { source: 'manual' } }));
    
    // Try to access React state if possible
    if (window.React && window.React.version) {
        console.log('⚛️ React version:', window.React.version);
    }
    
    console.log('✅ Emergency clear complete');
};

// Run diagnostics
console.log('🧪 Running initial diagnostics...');
checkReactState();
checkRouting();
const loadingElements = checkLoadingIndicators();
checkConsoleErrors();

console.log('💡 Available emergency functions:');
console.log('   - forceNavigateHome() - Navigate to home page');
console.log('   - emergencyClear() - Clear all loading states');
console.log('   - forceStopLoading() - Stop loading spinners');

// Auto-monitor for 30 seconds
let monitorCount = 0;
const monitor = setInterval(() => {
    monitorCount++;
    const current = checkLoadingIndicators();
    
    if (current.length === 0 || monitorCount >= 30) {
        console.log(current.length === 0 ? '✅ No loading indicators found' : '⏰ Monitor timeout');
        clearInterval(monitor);
    }
}, 1000);