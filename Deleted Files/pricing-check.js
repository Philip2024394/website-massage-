// Quick pricing check script to run in browser console
// This script will check pricing data and add sample data to therapists without pricing

console.log('🔍 Starting pricing analysis...');

// Check if the pricing helper utility is available
if (typeof window.pricingHelper !== 'undefined') {
    console.log('✅ Pricing helper available, checking therapist pricing...');
    window.pricingHelper.checkPricingStatus();
} else {
    console.log('❌ Pricing helper not available globally');
}

// Alternative method: check localStorage or therapist data
console.log('📋 Checking for therapist data in local storage or current state...');

// Look for any therapist-related data
const keys = Object.keys(localStorage);
const therapistKeys = keys.filter(key => key.includes('therapist') || key.includes('pricing'));
console.log('🔑 Therapist-related localStorage keys:', therapistKeys);

therapistKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`📊 ${key}:`, value?.substring(0, 100) + '...');
});