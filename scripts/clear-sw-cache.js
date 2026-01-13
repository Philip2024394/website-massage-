/**
 * Clear Service Worker Cache Script
 * 
 * Run this in your browser console to forcefully clear all service worker caches
 * and unregister service workers for development.
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Refresh the page (Ctrl+Shift+R for hard refresh)
 */

(async function clearServiceWorkerCache() {
    console.log('🧹 Starting Service Worker cache cleanup...');
    
    try {
        // 1. Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`📋 Found ${registrations.length} service worker(s)`);
            
            for (let registration of registrations) {
                await registration.unregister();
                console.log('✅ Unregistered service worker:', registration.scope);
            }
        }
        
        // 2. Clear all caches
        const cacheNames = await caches.keys();
        console.log(`📦 Found ${cacheNames.length} cache(s):`, cacheNames);
        
        for (let cacheName of cacheNames) {
            await caches.delete(cacheName);
            console.log('🗑️ Deleted cache:', cacheName);
        }
        
        // 3. Clear localStorage
        localStorage.clear();
        console.log('🗑️ Cleared localStorage');
        
        // 4. Clear sessionStorage
        sessionStorage.clear();
        console.log('🗑️ Cleared sessionStorage');
        
        console.log('✅ ✨ All service worker caches cleared!');
        console.log('🔄 Please refresh the page (Ctrl+Shift+R) to see fresh content');
        
        // Auto-refresh after 2 seconds
        setTimeout(() => {
            console.log('🔄 Auto-refreshing page...');
            window.location.reload(true);
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error clearing caches:', error);
    }
})();
