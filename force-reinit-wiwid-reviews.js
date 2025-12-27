/**
 * Force Re-initialization of Wiwid Reviews
 * Run this in the browser console to clear and reinitialize reviews
 */

// Clear existing reviews from localStorage
localStorage.removeItem('massage_app_reviews');
console.log('✅ Cleared old reviews from localStorage');

// Reload the page to reinitialize with correct Wiwid ID
window.location.reload();
