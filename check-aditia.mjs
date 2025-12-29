/**
 * Check Aditia's therapist data for location issues
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function checkAditia() {
    try {
        console.log('🔍 Searching for Aditia (indastreet29@gmail.com)...\n');
        
        // Search by email
        const therapists = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [
                Query.equal('email', 'indastreet29@gmail.com')
            ]
        );
        
        if (therapists.documents.length === 0) {
            console.log('❌ No therapist found with email indastreet29@gmail.com');
            
            // Try searching by name
            console.log('\n🔍 Trying to search by name "Aditia"...');
            const byName = await databases.listDocuments(
                '68f76ee1000e64ca8d05',
                'therapists_collection_id',
                [
                    Query.search('name', 'Aditia')
                ]
            );
            
            if (byName.documents.length > 0) {
                console.log(`\n✅ Found ${byName.documents.length} therapist(s) with name containing "Aditia":`);
                byName.documents.forEach((t, i) => {
                    console.log(`\n  ${i + 1}. ${t.name}`);
                    console.log(`     Email: ${t.email || 'N/A'}`);
                    console.log(`     Location: ${t.location || t.city || 'N/A'}`);
                    console.log(`     City field: ${t.city || 'N/A'}`);
                    console.log(`     Status: ${t.status || 'N/A'}`);
                    console.log(`     Coordinates: ${JSON.stringify(t.coordinates) || 'N/A'}`);
                });
            } else {
                console.log('❌ No therapists found with name "Aditia"');
            }
            
            return;
        }
        
        const aditia = therapists.documents[0];
        
        console.log('✅ Found Aditia!\n');
        console.log('📋 Profile Details:');
        console.log('==================');
        console.log(`Name: ${aditia.name}`);
        console.log(`Email: ${aditia.email}`);
        console.log(`Status: ${aditia.status}`);
        console.log(`\n📍 Location Data:`);
        console.log(`Location field: ${aditia.location || 'NOT SET'}`);
        console.log(`City field: ${aditia.city || 'NOT SET'}`);
        console.log(`Coordinates: ${JSON.stringify(aditia.coordinates) || 'NOT SET'}`);
        
        console.log(`\n💼 Profile Completion:`);
        console.log(`Description: ${aditia.description ? '✅' : '❌ Missing'}`);
        console.log(`WhatsApp: ${aditia.whatsappNumber ? '✅' : '❌ Missing'}`);
        console.log(`Price 60min: ${aditia.price60 ? '✅' : '❌ Missing'}`);
        
        console.log(`\n🔍 Location Issues:`);
        if (!aditia.location && !aditia.city) {
            console.log('❌ PROBLEM: No location OR city field set!');
            console.log('   Therapist will NOT appear in any city filter.');
        } else if (aditia.location) {
            const locationLower = aditia.location.toLowerCase();
            if (locationLower.includes('bandung')) {
                console.log('✅ Location contains "Bandung" - should appear in Bandung filter');
            } else {
                console.log(`⚠️  Location is "${aditia.location}" - does NOT contain "Bandung"`);
                console.log('   This is why therapist is not showing in Bandung dropdown!');
            }
        } else if (aditia.city) {
            console.log(`✅ City field: ${aditia.city}`);
            if (aditia.city.toLowerCase().includes('bandung')) {
                console.log('✅ City contains "Bandung" - should appear in Bandung filter');
            } else {
                console.log(`⚠️  City does NOT contain "Bandung" - won't show in Bandung filter`);
            }
        }
        
        console.log(`\n💡 Fix Required:`);
        if (!aditia.location && !aditia.city) {
            console.log('   1. Therapist needs to set their city in dashboard');
            console.log('   2. OR manually update location field to "Bandung, West Java"');
        } else if (aditia.location && !aditia.location.toLowerCase().includes('bandung')) {
            console.log(`   Current location: "${aditia.location}"`);
            console.log('   Should be: "Bandung" or "Bandung, West Java"');
            console.log('   Therapist needs to update location in their dashboard');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAditia();
