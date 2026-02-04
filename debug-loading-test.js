// Quick Loading State Test
// Add to browser console to test loading state

console.log('🧪 [LOADING TEST] Starting loading state diagnostic...');

// Check current loading state
const checkLoadingState = () => {
    const loadingElements = document.querySelectorAll('[data-loading-state]');
    const loadingSpinners = document.querySelectorAll('#react-loading-spinner');
    
    console.log('🔍 Loading elements found:', loadingElements.length);
    console.log('🔍 Loading spinners found:', loadingSpinners.length);
    
    loadingElements.forEach((el, index) => {
        console.log(`📊 Loading element ${index + 1}:`, {
            element: el.tagName,
            state: el.getAttribute('data-loading-state'),
            visible: el.offsetParent !== null,
            style: window.getComputedStyle(el).background
        });
    });
    
    return {
        hasLoadingElements: loadingElements.length > 0,
        hasSpinners: loadingSpinners.length > 0,
        isLoading: loadingElements.length > 0 && Array.from(loadingElements).some(el => el.offsetParent !== null)
    };
};

// Initial check
const initialState = checkLoadingState();
console.log('🎯 Initial loading state:', initialState);

// Monitor for changes
let checkCount = 0;
const monitor = setInterval(() => {
    checkCount++;
    const currentState = checkLoadingState();
    
    console.log(`⏰ Check #${checkCount}:`, currentState);
    
    if (!currentState.isLoading || checkCount >= 20) {
        console.log('🎉 [LOADING TEST] Complete - stopping monitor');
        clearInterval(monitor);
    }
}, 1000);

// Force loading state reset function
window.forceStopLoading = () => {
    console.log('🛑 [MANUAL] Force stopping all loading states...');
    
    // Remove all loading spinners
    document.querySelectorAll('#react-loading-spinner').forEach(el => {
        el.style.display = 'none';
        console.log('🗑️ Hidden loading spinner');
    });
    
    // Dispatch timeout event
    window.dispatchEvent(new CustomEvent('loadingTimeout', {
        detail: { message: 'Manual loading stop triggered' }
    }));
    
    console.log('✅ [MANUAL] Loading stop complete');
};

console.log('💡 Run forceStopLoading() to manually stop any stuck loading states');