// Clear browser session and localStorage to force fresh start
console.log('🧹 Clearing browser storage...');

// Clear sessionStorage
try {
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared');
} catch (e) {
    console.log('⚠️ Could not clear sessionStorage:', e.message);
}

// Clear localStorage 
try {
    localStorage.clear();
    console.log('✅ LocalStorage cleared');
} catch (e) {
    console.log('⚠️ Could not clear localStorage:', e.message);
}

// Force reload to fresh state
console.log('🔄 Reloading page...');
window.location.reload();