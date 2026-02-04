/**
 * localStorage Cleanup Utility
 * Use this to clear localStorage when it gets full during development
 */

export const clearAppStorage = () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Clear specific app data
        const keysToRemove = [
            'massage_app_reviews',
            'user_preferences',
            'chat_data',
            'booking_cache'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('🧹 localStorage cleaned up');
        
        // Show storage usage
        const usage = JSON.stringify(localStorage).length;
        console.log(`📊 localStorage usage: ${(usage / 1024).toFixed(2)}KB`);
        
        return true;
    }
    return false;
};

// Make it globally available for easy console access
if (typeof window !== 'undefined') {
    (window as any).clearAppStorage = clearAppStorage;
    
    // Log current storage usage
    const currentUsage = JSON.stringify(localStorage).length;
    if (currentUsage > 1024 * 1024) { // > 1MB
        console.warn(`⚠️ localStorage usage is high: ${(currentUsage / 1024 / 1024).toFixed(2)}MB`);
        console.log('💡 Run clearAppStorage() to clean up');
    }
}