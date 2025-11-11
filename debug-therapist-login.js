// Therapist Login Flow Debug Script
// Paste this into the browser console on http://localhost:3000/

console.log('🔧 Starting therapist login debug...');

// Function to check current app state
function checkAppState() {
    console.group('📊 Current App State');
    
    // Check localStorage
    const loggedInProvider = localStorage.getItem('app_logged_in_provider');
    const userId = localStorage.getItem('app_user_id');
    const therapistId = localStorage.getItem('app_therapist_id');
    
    console.log('LocalStorage:', {
        loggedInProvider: loggedInProvider ? JSON.parse(loggedInProvider) : null,
        userId,
        therapistId
    });
    
    // Check current URL/hash
    console.log('Current location:', {
        href: window.location.href,
        hash: window.location.hash,
        pathname: window.location.pathname
    });
    
    // Try to access React app state (if available)
    try {
        // Look for React DevTools or app instance
        const reactRoot = document.querySelector('#root');
        if (reactRoot && reactRoot._reactInternalInstance) {
            console.log('React instance found');
        }
        
        // Check if there's a global app reference
        if (window.appInstance) {
            console.log('App instance:', window.appInstance);
        }
        
        // Check for authentication modules
        console.log('Auth modules available:', {
            therapistAuth: !!window.therapistAuth,
            account: !!window.account
        });
        
    } catch (error) {
        console.log('Could not access React state:', error.message);
    }
    
    console.groupEnd();
}

// Function to simulate login
async function simulateLogin() {
    console.group('🔑 Simulating Login');
    
    try {
        // Check if auth is available
        if (!window.therapistAuth) {
            console.error('❌ therapistAuth not available. Navigate to therapist login page first.');
            console.log('💡 Try: window.location.hash = "#therapistLogin"');
            return;
        }
        
        console.log('✅ therapistAuth module found');
        
        // Use test credentials (you should replace with real ones)
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        
        console.log('🔵 Attempting login with test credentials...');
        console.log('📧 Email:', testEmail);
        console.log('🔒 Password: [hidden]');
        
        const result = await window.therapistAuth.signIn(testEmail, testPassword);
        
        console.log('📋 Login result:', result);
        
        if (result.success) {
            console.log('✅ Login successful!');
            console.log('🆔 User ID:', result.userId);
            console.log('📄 Document ID:', result.documentId);
            
            // Check if navigation happened
            setTimeout(() => {
                console.log('🔍 Checking post-login state...');
                checkAppState();
                
                // Check current hash
                if (window.location.hash === '#therapistDashboard') {
                    console.log('✅ Successfully navigated to therapist dashboard');
                } else {
                    console.log('❌ Navigation to dashboard failed');
                    console.log('Current hash:', window.location.hash);
                    console.log('💡 Try manually: window.location.hash = "#therapistDashboard"');
                }
            }, 1000);
            
        } else {
            console.error('❌ Login failed:', result.error);
        }
        
    } catch (error) {
        console.error('💥 Login error:', error);
    }
    
    console.groupEnd();
}

// Function to manually navigate to dashboard
function goToDashboard() {
    console.log('🎯 Manually navigating to dashboard...');
    
    // Try different navigation methods
    const methods = [
        () => { window.location.hash = '#therapistDashboard'; },
        () => { window.location.hash = '#therapist-dashboard'; },
        () => { 
            if (window.setPage) {
                window.setPage('therapistDashboard');
            }
        }
    ];
    
    methods.forEach((method, index) => {
        try {
            method();
            console.log(`✅ Method ${index + 1} executed`);
        } catch (error) {
            console.log(`❌ Method ${index + 1} failed:`, error.message);
        }
    });
    
    // Check result after delay
    setTimeout(() => {
        console.log('📍 Current location after navigation attempts:', window.location.hash);
    }, 500);
}

// Function to go to therapist login page
function goToLogin() {
    console.log('🚪 Navigating to therapist login...');
    window.location.hash = '#therapistLogin';
    
    setTimeout(() => {
        console.log('📍 Current location:', window.location.hash);
        console.log('💡 Now you can try: simulateLogin()');
    }, 500);
}

// Make functions available globally
window.checkAppState = checkAppState;
window.simulateLogin = simulateLogin;
window.goToDashboard = goToDashboard;
window.goToLogin = goToLogin;

// Instructions
console.log('🎮 Debug functions available:');
console.log('• checkAppState() - Check current app state');
console.log('• goToLogin() - Navigate to therapist login page');
console.log('• simulateLogin() - Attempt login (requires being on login page)');
console.log('• goToDashboard() - Try to navigate to dashboard');

// Run initial check
checkAppState();

// Auto-navigate to login if not already there
if (!window.location.hash.includes('therapist')) {
    console.log('💡 Auto-navigating to therapist login page...');
    setTimeout(goToLogin, 1000);
}

export {};