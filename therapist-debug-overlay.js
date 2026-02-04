// Therapist Debug Console Overlay
// Shows current therapist state directly on the page

const createDebugOverlay = () => {
    // Remove existing overlay if it exists
    const existing = document.getElementById('therapist-debug-overlay');
    if (existing) {
        existing.remove();
    }
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.id = 'therapist-debug-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
        max-height: 400px;
        overflow-y: auto;
        border: 2px solid #f97316;
    `;
    
    const updateOverlay = () => {
        const info = {
            timestamp: new Date().toLocaleTimeString(),
            therapistCards: document.querySelectorAll('[class*="therapist"], [data-therapist]').length,
            homePageCards: document.querySelectorAll('[class*="TherapistHomeCard"]').length,
            loadingSpinners: document.querySelectorAll('#react-loading-spinner').length,
            errors: window.__errorCount || 0,
            url: window.location.href,
            page: window.location.pathname,
            hash: window.location.hash
        };
        
        overlay.innerHTML = `
            <div style="color: #f97316; font-weight: bold; margin-bottom: 8px;">🔍 THERAPIST DEBUG</div>
            <div><strong>Time:</strong> ${info.timestamp}</div>
            <div><strong>Therapist Cards:</strong> ${info.therapistCards}</div>
            <div><strong>Home Cards:</strong> ${info.homePageCards}</div>
            <div><strong>Loading:</strong> ${info.loadingSpinners}</div>
            <div><strong>Errors:</strong> ${info.errors}</div>
            <div><strong>Page:</strong> ${info.page}</div>
            <div><strong>Hash:</strong> ${info.hash}</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444;">
                <button onclick="window.forceDataRefresh?.()" style="background: #f97316; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-right: 4px; cursor: pointer;">Refresh</button>
                <button onclick="document.getElementById('therapist-debug-overlay').remove()" style="background: #666; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Hide</button>
            </div>
        `;
    };
    
    updateOverlay();
    document.body.appendChild(overlay);
    
    // Auto-update every 2 seconds
    const interval = setInterval(() => {
        if (!document.getElementById('therapist-debug-overlay')) {
            clearInterval(interval);
            return;
        }
        updateOverlay();
    }, 2000);
    
    console.log('🔍 Debug overlay added. Auto-updates every 2 seconds.');
};

// Auto-create overlay
createDebugOverlay();

// Make it available globally
window.showDebugOverlay = createDebugOverlay;