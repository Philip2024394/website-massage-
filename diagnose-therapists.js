/**
 * THERAPIST CONNECTION DIAGNOSTIC SCRIPT
 * Open browser console (F12) and paste this entire script to diagnose therapist fetch issues
 * Run in browser console at: http://127.0.0.1:3001
 */

(async function() {
    console.log('🔍 STARTING THERAPIST DIAGNOSTIC...\n');
    
    // Step 1: Check Appwrite SDK
    console.log('📦 Step 1: Checking Appwrite SDK...');
    try {
        const { Client, Databases, Query } = await import('./lib/appwrite');
        console.log('✅ Appwrite SDK loaded successfully');
        console.log('   Client:', !!Client);
        console.log('   Databases:', !!Databases);
        console.log('   Query:', !!Query);
    } catch (error) {
        console.error('❌ Failed to load Appwrite SDK:', error);
        return;
    }
    
    // Step 2: Check Configuration
    console.log('\n📋 Step 2: Checking Configuration...');
    try {
        const { databases, DATABASE_ID, COLLECTIONS } = await import('./lib/appwrite');
        console.log('✅ Configuration loaded:');
        console.log('   Database ID:', DATABASE_ID);
        console.log('   Therapists Collection:', COLLECTIONS.THERAPISTS);
        console.log('   Endpoint:', databases?.client?.config?.endpoint);
        console.log('   Project ID:', databases?.client?.config?.project);
    } catch (error) {
        console.error('❌ Failed to load configuration:', error);
        return;
    }
    
    // Step 3: Test Direct Appwrite Query
    console.log('\n🔌 Step 3: Testing Direct Appwrite Query...');
    try {
        const { databases, DATABASE_ID, COLLECTIONS, Query } = await import('./lib/appwrite');
        
        console.log('   Attempting to list documents...');
        console.log('   Database:', DATABASE_ID);
        console.log('   Collection:', COLLECTIONS.THERAPISTS);
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.THERAPISTS,
            [
                Query.limit(10),
                Query.equal('isLive', true)
            ]
        );
        
        console.log('✅ Direct query successful!');
        console.log('   Total documents:', response.total);
        console.log('   Returned documents:', response.documents.length);
        
        if (response.documents.length > 0) {
            console.log('\n📄 Sample therapist data:');
            const sample = response.documents[0];
            console.log('   ID:', sample.$id);
            console.log('   Name:', sample.name);
            console.log('   IsLive:', sample.isLive);
            console.log('   City:', sample.city);
            console.log('   Location:', sample.location);
        } else {
            console.warn('⚠️  No therapists found in database');
        }
    } catch (error) {
        console.error('❌ Direct query failed:', error);
        console.error('   Error message:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error type:', error.type);
        return;
    }
    
    // Step 4: Test Service Layer
    console.log('\n🔧 Step 4: Testing Service Layer...');
    try {
        const { therapistService } = await import('./lib/appwriteService');
        console.log('   Calling therapistService.getAll()...');
        
        const therapists = await therapistService.getAll();
        console.log('✅ Service layer successful!');
        console.log('   Therapists returned:', therapists.length);
        
        if (therapists.length > 0) {
            console.log('\n📊 Therapist details:');
            therapists.slice(0, 3).forEach((t, i) => {
                console.log(`   ${i + 1}. ${t.name} (${t.city || 'no city'})`);
            });
        }
    } catch (error) {
        console.error('❌ Service layer failed:', error);
        console.error('   Error message:', error.message);
        return;
    }
    
    // Step 5: Check for Network Issues
    console.log('\n🌐 Step 5: Testing Network Connectivity...');
    try {
        const response = await fetch('https://syd.cloud.appwrite.io/v1/health');
        if (response.ok) {
            console.log('✅ Appwrite endpoint reachable');
            const data = await response.json();
            console.log('   Status:', data.status || 'OK');
        } else {
            console.warn('⚠️  Appwrite returned status:', response.status);
        }
    } catch (error) {
        console.error('❌ Network connectivity issue:', error.message);
    }
    
    console.log('\n🎯 DIAGNOSTIC COMPLETE!');
    console.log('\nIf you see errors above, please share the error messages.');
})();
