// Debug script to test navigation flow
console.log('🔍 Navigation Debug Script Started');

// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    console.log('📝 localStorage.setItem:', key, value);
    return originalSetItem.apply(this, arguments);
};

// Monitor page state changes
let pageChangeCount = 0;
const originalConsoleLog = console.log;
console.log = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('📍 Page change:')) {
        pageChangeCount++;
        console.warn(`🎯 PAGE CHANGE #${pageChangeCount}:`, args);
    }
    return originalConsoleLog.apply(this, arguments);
};

// Check current app state
setTimeout(() => {
    console.log('🔍 Current App State:');
    console.log('- Current page state:', window.location.href);
    console.log('- localStorage app_language:', localStorage.getItem('app_language'));
    console.log('- localStorage app_user_location:', localStorage.getItem('app_user_location'));
    console.log('- sessionStorage start_fresh:', sessionStorage.getItem('start_fresh'));
    
    // Check if React components are mounted
    const landingElements = document.querySelectorAll('[data-testid="landing-page"], .landing-page, h1');
    const homeElements = document.querySelectorAll('[data-testid="home-page"], .home-page');
    
    console.log('📱 DOM Elements:');
    console.log('- Landing elements found:', landingElements.length);
    console.log('- Home elements found:', homeElements.length);
    
    if (landingElements.length > 0) {
        landingElements.forEach((el, i) => {
            console.log(`  Landing ${i}:`, el.textContent?.substring(0, 50));
        });
    }
    
    if (homeElements.length > 0) {
        homeElements.forEach((el, i) => {
            console.log(`  Home ${i}:`, el.textContent?.substring(0, 50));
        });
    }
}, 2000);

console.log('✅ Debug monitoring active - press Enter App and check logs');