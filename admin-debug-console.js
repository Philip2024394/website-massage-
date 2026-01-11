// Admin Dashboard Therapist Loading Test Script
// Run this in the browser console on localhost:3004

console.log('🔍 [THERAPIST DEBUG] Starting admin dashboard therapist debugging...');

// Function to check current state
function checkAdminDashboardState() {
    console.log('📊 [STATE CHECK] Checking current admin dashboard state...');
    
    // Check if React components are loaded
    if (typeof window.React !== 'undefined') {
        console.log('✅ React is loaded');
    } else {
        console.log('⚠️ React not found in window');
    }
    
    // Check localStorage for any cached data
    const keys = Object.keys(localStorage);
    console.log('💾 LocalStorage keys:', keys);
    
    // Check if there are any error messages in the console
    console.log('🔍 [STATE CHECK] Check the Network tab for failed API requests');
    console.log('🔍 [STATE CHECK] Check the Console tab for JavaScript errors');
}

// Function to manually test therapist service
async function testTherapistServiceManually() {
    console.log('🧪 [MANUAL TEST] Testing therapist service manually...');
    
    try {
        // Try to access the Appwrite SDK
        if (typeof Appwrite === 'undefined') {
            console.log('⚠️ Appwrite SDK not found, loading from CDN...');
            
            // Load Appwrite SDK
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/appwrite@13/dist/browser/appwrite.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = resolve;
            });
            
            console.log('✅ Appwrite SDK loaded');
        }
        
        // Initialize Appwrite client
        const { Client, Databases, Query } = Appwrite;
        
        const client = new Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');
        
        const databases = new Databases(client);
        
        // Test therapist collection
        console.log('📋 Fetching therapists from Appwrite...');
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05', // Database ID
            'therapists_collection_id', // Collection ID
            [Query.limit(100)]
        );
        
        console.log('✅ Therapists fetched:', response.documents.length);
        
        if (response.documents.length > 0) {
            // Analyze status distribution
            const statusCounts = response.documents.reduce((acc, therapist) => {
                const status = therapist.status || 'no-status';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📊 Status distribution:', statusCounts);
            
            // Show first few therapists
            console.log('👥 First 3 therapists:');
            response.documents.slice(0, 3).forEach((therapist, index) => {
                console.log(`   ${index + 1}. ${therapist.name} (${therapist.status || 'no-status'})`);
            });
            
            // Check if any are active
            const activeCount = response.documents.filter(t => t.status === 'active').length;
            const pendingCount = response.documents.filter(t => t.status === 'pending').length;
            const inactiveCount = response.documents.filter(t => t.status === 'inactive').length;
            
            console.log('📈 Breakdown:');
            console.log(`   Active: ${activeCount}`);
            console.log(`   Pending: ${pendingCount}`);
            console.log(`   Inactive: ${inactiveCount}`);
            console.log(`   No status: ${response.documents.length - activeCount - pendingCount - inactiveCount}`);
            
            // Diagnosis
            if (activeCount === 0) {
                console.log('⚠️ DIAGNOSIS: No active therapists found!');
                console.log('💡 SOLUTION: Change therapist status to "active" in Appwrite database');
                console.log('💡 OR: Check if admin dashboard is filtering by status');
            } else {
                console.log('✅ DIAGNOSIS: Active therapists available - issue may be in admin dashboard rendering');
            }
            
        } else {
            console.log('❌ No therapists found in database');
        }
        
    } catch (error) {
        console.error('❌ Error testing therapist service:', error);
        
        if (error.message.includes('Collection with the requested ID could not be found')) {
            console.log('💡 FIX: Collection ID "therapists_collection_id" does not exist');
            console.log('💡 CHECK: Verify collection ID in Appwrite console');
        } else if (error.message.includes('not authorized')) {
            console.log('💡 FIX: Set collection permissions to allow "any" role to read');
        }
    }
}

// Function to check admin dashboard imports
function checkAdminDashboardImports() {
    console.log('📦 [IMPORT CHECK] Checking admin dashboard imports...');
    
    // Check if admin dashboard modules are available
    const moduleChecks = [
        'React',
        'ReactDOM'
    ];
    
    moduleChecks.forEach(module => {
        if (typeof window[module] !== 'undefined') {
            console.log(`✅ ${module} is available`);
        } else {
            console.log(`❌ ${module} is not available`);
        }
    });
}

// Function to simulate admin dashboard data flow
function simulateAdminDataFlow() {
    console.log('🔄 [SIMULATION] Simulating admin dashboard data flow...');
    
    // Check current URL and active view
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    // Look for any admin dashboard specific elements
    const adminElements = {
        'Therapist Cards button': document.querySelector('[data-view="therapists"]') || document.querySelector('button:contains("Therapist")'),
        'Dashboard container': document.querySelector('.admin-dashboard') || document.querySelector('[data-testid="admin-dashboard"]'),
        'Loading indicator': document.querySelector('.loading') || document.querySelector('[data-testid="loading"]'),
        'Error message': document.querySelector('.error') || document.querySelector('[data-testid="error"]'),
        'Empty state': document.querySelector('.empty-state') || document.querySelector('[data-testid="empty-state"]')
    };
    
    Object.entries(adminElements).forEach(([name, element]) => {
        if (element) {
            console.log(`✅ Found: ${name}`);
        } else {
            console.log(`❌ Not found: ${name}`);
        }
    });
    
    // Check for any React components in DOM
    const reactElements = document.querySelectorAll('[data-reactroot], [data-reactid]');
    console.log(`🔍 React elements found: ${reactElements.length}`);
}

// Main debugging function
async function debugAdminTherapists() {
    console.log('🚀 [DEBUG START] ================================');
    console.log('🚀 Admin Dashboard Therapist Debug Session');
    console.log('🚀 [DEBUG START] ================================');
    
    // Step 1: Check current state
    checkAdminDashboardState();
    console.log('');
    
    // Step 2: Check imports
    checkAdminDashboardImports();
    console.log('');
    
    // Step 3: Simulate data flow
    simulateAdminDataFlow();
    console.log('');
    
    // Step 4: Test therapist service manually
    await testTherapistServiceManually();
    console.log('');
    
    console.log('🎯 [NEXT STEPS] ================================');
    console.log('1. Navigate to "Therapists" section in admin dashboard');
    console.log('2. Open browser console and check for errors');
    console.log('3. Check Network tab for failed API requests');
    console.log('4. Verify that therapist status filter is not hiding all therapists');
    console.log('🎯 [NEXT STEPS] ================================');
}

// Auto-run if in admin dashboard
if (window.location.hostname === 'localhost' && window.location.port === '3004') {
    console.log('🏠 Detected admin dashboard - running automatic debug...');
    setTimeout(() => {
        debugAdminTherapists();
    }, 2000); // Wait 2 seconds for page to load
}

// Export functions for manual use
window.debugAdminTherapists = debugAdminTherapists;
window.testTherapistServiceManually = testTherapistServiceManually;

console.log('🔧 [READY] Debug functions available:');
console.log('   debugAdminTherapists() - Run full debug');
console.log('   testTherapistServiceManually() - Test Appwrite connection');