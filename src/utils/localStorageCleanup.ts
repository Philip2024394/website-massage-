// OOM/Storage: cleanup and quota guard – keep payloads small, remove corrupted or oversized entries
const MAX_VALUE_BYTES = 50 * 1024; // 50KB per key

export const cleanupLocalStorage = () => {
  const keysToCheck = [
    'app_language',
    'app_user',
    'app_user_location',
    'app_selected_place',
    'app_selected_massage_type',
    'app_is_admin_logged_in',
  ];
  try {
    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (!value) return;
        const size = new Blob([value]).size;
        if (size > MAX_VALUE_BYTES) {
          localStorage.removeItem(key);
          return;
        }
        if (key === 'app_language') {
          if (value !== 'en' && value !== 'id' && value !== 'gb') {
            localStorage.setItem(key, 'id');
          }
        } else {
          JSON.parse(value);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // ignore
  }
};

// Auto-cleanup on app load
if (typeof window !== 'undefined') {
  cleanupLocalStorage();
}