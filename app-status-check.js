// Quick Application Status Check Script
// Run this in browser console to verify app state

function quickAppCheck() {
    console.log('🔍 Quick Application Status Check');
    console.log('=' .repeat(40));
    
    // Check if React app is loaded
    const hasReact = document.querySelector('#root') && document.querySelector('#root').children.length > 0;
    console.log(`React App Loaded: ${hasReact ? '✅' : '❌'}`);
    
    // Check for main navigation elements
    const hasNavigation = document.body.textContent.includes('Home') || 
                         document.body.textContent.includes('Admin') ||
                         document.querySelectorAll('button').length > 0;
    console.log(`Navigation Elements: ${hasNavigation ? '✅' : '❌'}`);
    
    // Check for console errors
    console.log('Console Errors: Check browser console for any red error messages');
    
    // Check if auth functions are available
    const hasAuthFunctions = typeof window.setPage === 'function' ||
                            document.body.textContent.includes('Sign In') ||
                            document.body.textContent.includes('Login');
    console.log(`Auth System Ready: ${hasAuthFunctions ? '✅' : '❌'}`);
    
    // List available buttons/links for navigation
    const buttons = Array.from(document.querySelectorAll('button, a'))
        .map(el => el.textContent.trim())
        .filter(text => text.length > 0 && text.length < 50);
    
    console.log('\n📍 Available Navigation Elements:');
    buttons.slice(0, 10).forEach(button => console.log(`  - ${button}`));
    if (buttons.length > 10) console.log(`  ... and ${buttons.length - 10} more`);
    
    // Check current page content
    const bodyText = document.body.textContent.toLowerCase();
    const isHomePage = bodyText.includes('home') || bodyText.includes('welcome');
    const isLoginPage = bodyText.includes('sign in') || bodyText.includes('login');
    const isDashboard = bodyText.includes('dashboard');
    
    console.log('\n📱 Current Page Type:');
    console.log(`  Home Page: ${isHomePage ? '✅' : '❌'}`);
    console.log(`  Login Page: ${isLoginPage ? '✅' : '❌'}`);
    console.log(`  Dashboard: ${isDashboard ? '✅' : '❌'}`);
    
    return {
        reactLoaded: hasReact,
        navigationReady: hasNavigation,
        authSystemReady: hasAuthFunctions,
        availableButtons: buttons,
        currentPageType: { isHomePage, isLoginPage, isDashboard }
    };
}

// Auto-run check
window.quickAppCheck = quickAppCheck;
console.log('🔍 App Status Checker Loaded! Run: quickAppCheck()');