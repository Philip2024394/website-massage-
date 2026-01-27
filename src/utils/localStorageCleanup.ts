// localStorage cleanup utility for fixing corrupted data
export const cleanupLocalStorage = () => {
  console.log('🧹 Cleaning up localStorage...');
  
  // List of keys that might have corrupted data
  const keysToCheck = [
    'app_language',
    'app_user',
    'app_user_location', 
    'app_selected_place',
    'app_selected_massage_type',
    'app_is_admin_logged_in'
  ];
  
  keysToCheck.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Try to parse - if it fails, the data is corrupted
        if (key === 'app_language') {
          // app_language should be a simple string 'id' (default), 'en', or 'gb'
          if (value !== 'en' && value !== 'id' && value !== 'gb') {
            console.log(`🔧 Fixing corrupted ${key}: ${value} -> 'id'`);
            localStorage.setItem(key, 'id');
          }
        } else {
          // Other keys should be valid JSON
          JSON.parse(value);
        }
      }
    } catch (error) {
      console.log(`🗑️ Removing corrupted ${key}:`, (error as Error).message);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ localStorage cleanup complete');
};

// Auto-cleanup on app load
if (typeof window !== 'undefined') {
  cleanupLocalStorage();
}