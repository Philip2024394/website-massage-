// Debug Status Card Display
// This script helps test the actual vs display status in therapist cards

console.log('🐛 STATUS CARD DEBUG HELPER');
console.log('============================');

// Note: 80% offline→busy feature has been removed
console.log('ℹ️  Cards now always show ACTUAL therapist status');
console.log('ℹ️  No more fake busy display for offline therapists');

// Legacy function - no longer needed but kept for compatibility
function enableActualStatusDisplay() {
    console.log('ℹ️  This function is no longer needed - cards always show actual status');
}

// Legacy function - no longer needed but kept for compatibility  
function disableActualStatusDisplay() {
    console.log('ℹ️  This function is no longer needed - cards always show actual status');
}

// Check current debug mode
function checkDebugMode() {
    console.log('🔍 Status display: ALWAYS ACTUAL (80% offline→busy logic removed)');
    return true; // Always showing actual status now
}

// Monitor status changes in real-time
function monitorStatusChanges() {
    let monitorInterval;
    
    function startMonitoring() {
        console.log('👀 Starting status monitoring...');
        monitorInterval = setInterval(() => {
            const statusBadges = document.querySelectorAll('[class*="status"], [class*="available"], [class*="busy"], [class*="offline"]');
            const therapistNames = document.querySelectorAll('h3, [class*="name"]');
            
            console.log(`📊 Found ${statusBadges.length} status elements on page`);
            
            statusBadges.forEach((badge, index) => {
                const name = therapistNames[index]?.textContent || `Therapist ${index + 1}`;
                const status = badge.textContent?.trim();
                if (status) {
                    console.log(`   ${name}: ${status}`);
                }
            });
        }, 5000); // Every 5 seconds
        
        console.log('⏰ Monitoring started (every 5 seconds)');
        console.log('🛑 Use stopMonitoring() to stop');
    }
    
    function stopMonitoring() {
        if (monitorInterval) {
            clearInterval(monitorInterval);
            console.log('⏹️ Status monitoring stopped');
        }
    }
    
    // Return control functions
    return { startMonitoring, stopMonitoring };
}

// Test status update flow
function testStatusFlow(therapistName = 'any') {
    console.log('🧪 STATUS UPDATE TEST FLOW');
    console.log('1. Change therapist status in dashboard');
    console.log('2. Navigate to home page');
    console.log('3. Check if card reflects the change');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Cards now always show actual therapist status');
    console.log('   - Use monitorStatusChanges() to watch in real-time');
    console.log('   - Check browser console for debug messages');
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.enableActualStatusDisplay = enableActualStatusDisplay;
    window.disableActualStatusDisplay = disableActualStatusDisplay;
    window.checkDebugMode = checkDebugMode;
    window.monitorStatusChanges = monitorStatusChanges;
    window.testStatusFlow = testStatusFlow;
}

console.log('');
console.log('🛠️ AVAILABLE FUNCTIONS:');
console.log('   enableActualStatusDisplay() - Legacy (no longer needed)');
console.log('   disableActualStatusDisplay() - Legacy (no longer needed)');
console.log('   checkDebugMode() - Shows current status display mode');
console.log('   monitorStatusChanges() - Watch status changes in real-time');
console.log('   testStatusFlow() - Get testing instructions');
console.log('');

// Auto-check current state
checkDebugMode();

console.log('🚀 Ready for status testing!');