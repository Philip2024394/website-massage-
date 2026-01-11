/**
 * Test Admin Dashboard Therapist Loading
 * Verify why therapists are not displaying in admin dashboard
 */

console.log('🔍 [ADMIN THERAPIST TEST] ================================');
console.log('🔍 [ADMIN THERAPIST TEST] Testing therapist loading...');
console.log('🔍 [ADMIN THERAPIST TEST] ================================');

// Test therapist service directly
async function testTherapistService() {
    try {
        // Dynamic import to match admin dashboard
        console.log('📚 [IMPORT TEST] Importing therapist service...');
        
        // Test multiple import paths to identify the issue
        let therapistService;
        
        try {
            // Try path used in admin dashboard
            const module1 = await import('./lib/appwriteService.js');
            therapistService = module1.therapistService;
            console.log('✅ [IMPORT TEST] Successfully imported from lib/appwriteService');
        } catch (error1) {
            console.log('❌ [IMPORT TEST] Failed lib/appwriteService:', error1.message);
            
            try {
                // Try direct service path
                const module2 = await import('./lib/appwrite/services/therapist.service.js');
                therapistService = module2.therapistService;
                console.log('✅ [IMPORT TEST] Successfully imported from direct service path');
            } catch (error2) {
                console.log('❌ [IMPORT TEST] Failed direct service:', error2.message);
                throw new Error('Could not import therapist service');
            }
        }
        
        console.log('🔍 [SERVICE TEST] Calling therapistService.getAll()...');
        const therapists = await therapistService.getAll();
        
        console.log('✅ [SERVICE TEST] Raw therapist count:', therapists.length);
        console.log('✅ [SERVICE TEST] First 3 therapist names:', therapists.slice(0, 3).map(t => t.name));
        
        // Transform for admin dashboard format
        console.log('🔄 [TRANSFORM TEST] Transforming data for admin dashboard...');
        const transformedTherapists = therapists.map((therapist) => ({
            $id: therapist.$id,
            name: therapist.name,
            description: therapist.description || therapist.bio || therapist.about || '',
            profileImage: therapist.profileImage || therapist.mainImage || therapist.image || (therapist.images && therapist.images[0]),
            status: therapist.status || 'active',
            location: therapist.location,
            phone: therapist.whatsappNumber || therapist.phoneNumber,
            email: therapist.email,
            rating: therapist.averageRating || 0,
            reviews: therapist.totalReviews || 0
        }));
        
        console.log('✅ [TRANSFORM TEST] Transformed count:', transformedTherapists.length);
        console.log('✅ [TRANSFORM TEST] Sample transformed therapist:');
        console.log('   Name:', transformedTherapists[0]?.name);
        console.log('   Status:', transformedTherapists[0]?.status);
        console.log('   Profile Image:', transformedTherapists[0]?.profileImage ? 'HAS IMAGE' : 'NO IMAGE');
        console.log('   Description:', transformedTherapists[0]?.description ? 'HAS DESCRIPTION' : 'NO DESCRIPTION');
        
        // Check status distribution
        const statusCounts = transformedTherapists.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});
        
        console.log('📊 [STATUS TEST] Therapist status distribution:', statusCounts);
        
        // Check if any have actual content
        const withDescription = transformedTherapists.filter(t => t.description && t.description.length > 0).length;
        const withImage = transformedTherapists.filter(t => t.profileImage).length;
        const withLocation = transformedTherapists.filter(t => t.location).length;
        
        console.log('📊 [CONTENT TEST] Content availability:');
        console.log('   With Description:', withDescription, '/', transformedTherapists.length);
        console.log('   With Profile Image:', withImage, '/', transformedTherapists.length);
        console.log('   With Location:', withLocation, '/', transformedTherapists.length);
        
        // Test admin dashboard filtering
        console.log('🔍 [FILTER TEST] Testing admin dashboard filters...');
        
        // All filter
        const allTherapists = transformedTherapists;
        console.log('   All filter:', allTherapists.length, 'therapists');
        
        // Active filter
        const activeTherapists = transformedTherapists.filter(t => t.status === 'active');
        console.log('   Active filter:', activeTherapists.length, 'therapists');
        
        // Pending filter
        const pendingTherapists = transformedTherapists.filter(t => t.status === 'pending');
        console.log('   Pending filter:', pendingTherapists.length, 'therapists');
        
        // Inactive filter
        const inactiveTherapists = transformedTherapists.filter(t => t.status === 'inactive');
        console.log('   Inactive filter:', inactiveTherapists.length, 'therapists');
        
        console.log('🎯 [DIAGNOSIS] Likely causes if admin dashboard shows no therapists:');
        if (transformedTherapists.length === 0) {
            console.log('   ❌ NO THERAPISTS FETCHED - Check Appwrite connection');
        } else if (activeTherapists.length === 0) {
            console.log('   ⚠️ NO ACTIVE THERAPISTS - All therapists may be pending/inactive');
            console.log('   💡 SOLUTION: Check if admin dashboard is filtering by "active" status only');
        } else {
            console.log('   ✅ DATA AVAILABLE - Issue may be in admin dashboard rendering');
            console.log('   💡 SOLUTION: Check admin dashboard component state and console logs');
        }
        
        return {
            success: true,
            count: transformedTherapists.length,
            activeCount: activeTherapists.length,
            data: transformedTherapists
        };
        
    } catch (error) {
        console.error('❌ [SERVICE TEST] Error testing therapist service:', error);
        return {
            success: false,
            error: error.message,
            count: 0
        };
    }
}

// Test Appwrite configuration
async function testAppwriteConfig() {
    try {
        console.log('🔧 [CONFIG TEST] Testing Appwrite configuration...');
        
        const config = await import('./lib/appwrite.config.js');
        console.log('✅ [CONFIG TEST] Appwrite config loaded');
        console.log('   Endpoint:', config.APPWRITE_CONFIG?.endpoint || 'NOT SET');
        console.log('   Project ID:', config.APPWRITE_CONFIG?.projectId || 'NOT SET');
        console.log('   Database ID:', config.APPWRITE_CONFIG?.databaseId || 'NOT SET');
        console.log('   Therapists Collection:', config.APPWRITE_CONFIG?.collections?.therapists || 'NOT SET');
        
        return config.APPWRITE_CONFIG;
    } catch (error) {
        console.error('❌ [CONFIG TEST] Error loading Appwrite config:', error);
        return null;
    }
}

// Run tests
async function runTests() {
    console.log('🚀 [ADMIN THERAPIST TEST] Starting diagnostic tests...\n');
    
    // Test 1: Appwrite configuration
    const config = await testAppwriteConfig();
    console.log('');
    
    // Test 2: Therapist service
    const serviceResult = await testTherapistService();
    console.log('');
    
    // Summary
    console.log('📋 [SUMMARY] ==============================');
    console.log('📋 [SUMMARY] Admin Dashboard Therapist Test');
    console.log('📋 [SUMMARY] ==============================');
    
    if (config) {
        console.log('✅ Appwrite Config: LOADED');
    } else {
        console.log('❌ Appwrite Config: FAILED');
    }
    
    if (serviceResult.success) {
        console.log('✅ Therapist Service: WORKING');
        console.log('📊 Total Therapists:', serviceResult.count);
        console.log('📊 Active Therapists:', serviceResult.activeCount);
        
        if (serviceResult.count > 0 && serviceResult.activeCount === 0) {
            console.log('⚠️ WARNING: No active therapists found!');
            console.log('💡 RECOMMENDATION: Check therapist statuses in Appwrite database');
        } else if (serviceResult.count === 0) {
            console.log('❌ ERROR: No therapists found in database');
            console.log('💡 RECOMMENDATION: Check Appwrite collections and permissions');
        } else {
            console.log('✅ DIAGNOSIS: Therapists should display in admin dashboard');
            console.log('💡 If still not showing, check admin dashboard console for React errors');
        }
    } else {
        console.log('❌ Therapist Service: FAILED -', serviceResult.error);
    }
    
    console.log('📋 [SUMMARY] ==============================\n');
}

// Execute tests
runTests().catch(console.error);