/**
 * Debug Menu Loading Issues on Live Site
 * This will help identify why Surtiningsih's 12 menu items aren't showing
 */

import { Client, Databases, Query } from 'node-appwrite';

// Use BROWSER configuration (no API key - simulates live site)
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function debugLiveSiteMenuLoading() {
    console.log('🔍 DEBUGGING LIVE SITE MENU LOADING ISSUES');
    console.log('════════════════════════════════════════════\n');
    
    // Surtiningsih's details (the therapist with 12 menu items)
    const therapistId = '693cfadf003d16b9896a';
    const therapistName = 'Surtiningsih';
    
    console.log(`👤 Testing menu load for: ${therapistName}`);
    console.log(`📋 Therapist ID: ${therapistId}\n`);
    
    try {
        console.log('🔄 Step 1: Testing menu collection access...');
        
        // Simulate exactly what TherapistCard.tsx does
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',  // databaseId
            'therapist_menus',        // collection ID (same as APPWRITE_CONFIG.collections.therapistMenus)
            [
                Query.equal('therapistId', therapistId),
                Query.orderDesc('$updatedAt'),
                Query.limit(1)
            ]
        );
        
        console.log(`📊 Query Result: Found ${response.documents.length} menu documents`);
        
        if (response.documents.length === 0) {
            console.log('❌ PROBLEM IDENTIFIED: No menu document found!');
            console.log('   This explains why live site shows "1 traditional price"');
            console.log('\n🔍 Possible causes:');
            console.log('   1. Therapist ID mismatch between dev and live');
            console.log('   2. Menu document was deleted/corrupted');
            console.log('   3. Collection permissions changed');
            console.log('   4. Database/collection ID different on live site');
            
        } else {
            const menuDoc = response.documents[0];
            console.log('✅ Menu document found!');
            console.log(`📄 Document ID: ${menuDoc.$id}`);
            console.log(`👤 Document therapistId: ${menuDoc.therapistId}`);
            console.log(`📅 Last updated: ${menuDoc.$updatedAt}`);
            console.log(`🔢 Menu data length: ${menuDoc.menuData?.length || 0} chars`);
            
            if (menuDoc.menuData) {
                try {
                    const parsed = JSON.parse(menuDoc.menuData);
                    console.log(`✅ Successfully parsed menu: ${parsed.length} services`);
                    console.log('\n🍽️ Services found:');
                    parsed.forEach((service, index) => {
                        console.log(`   ${index + 1}. ${service.serviceName || service.name || 'Unnamed'}`);
                    });
                    
                    if (parsed.length === 12) {
                        console.log('\n🎯 CONFIRMED: This should show 12 menu items on live site!');
                        console.log('   If live site still shows "1 traditional", check:');
                        console.log('   - Browser console for JavaScript errors');
                        console.log('   - Network tab for failed API calls');
                        console.log('   - TherapistCard component error handling');
                    }
                    
                } catch (parseError) {
                    console.log('❌ JSON Parse Error:', parseError.message);
                    console.log('   Corrupted menu data - this would cause fallback');
                }
            } else {
                console.log('❌ No menuData field - this would cause fallback');
            }
        }
        
    } catch (error) {
        console.log('❌ QUERY FAILED:', error.message);
        console.log(`   Error code: ${error.code}`);
        
        if (error.code === 401) {
            console.log('\n💡 SOLUTION: Collection permissions issue');
            console.log('   Live site needs read permissions for therapist_menus collection');
        } else if (error.code === 404) {
            console.log('\n💡 SOLUTION: Collection not found');
            console.log('   Check if therapist_menus collection exists on live database');
        } else {
            console.log('\n🚨 Unexpected error - check live site configuration');
        }
    }
    
    console.log('\n' + '════════════════════════════════════════════');
    console.log('End of debug session');
}

debugLiveSiteMenuLoading();