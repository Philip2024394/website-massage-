// Clear session to force landing page
console.log('🧹 Forcing fresh session...');

try {
    // Clear session storage to force landing page
    sessionStorage.removeItem('has_entered_app');
    sessionStorage.removeItem('current_page');
    console.log('✅ Session cleared');
    
    // Force reload
    window.location.reload();
} catch (e) {
    console.error('❌ Failed to clear session:', e.message);
}