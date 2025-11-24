const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_6cb9a37b6b08c00e66e00ce3e2e25c8fe55f8c4c2e2e1f5e0c5d62fef3dae28a5a7bf59ac4d2db3e36e8e66a8d2e8fbc56c2a1f0b3e9d7c4f6e8a2b5d3c7e9f1a4b6');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

async function diagnoseTherapistCard() {
    try {
        console.log('🔍 Fetching all therapists to diagnose display issues...\n');
        
        const response = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            []
        );
        
        console.log(`Found ${response.documents.length} therapist(s)\n`);
        
        response.documents.forEach((therapist, index) => {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`Therapist ${index + 1}: ${therapist.name || 'Unnamed'}`);
            console.log(`${'='.repeat(80)}`);
            console.log(`ID: ${therapist.$id}`);
            console.log(`Email: ${therapist.email || 'N/A'}`);
            console.log(`Status: ${therapist.status || 'N/A'}`);
            console.log(`Is Live: ${therapist.isLive}`);
            
            // DISCOUNT CHECK
            console.log(`\n🎯 DISCOUNT DATA:`);
            console.log(`  discountPercentage: ${therapist.discountPercentage || 'NOT SET'}`);
            console.log(`  discountEndTime: ${therapist.discountEndTime || 'NOT SET'}`);
            console.log(`  isDiscountActive: ${therapist.isDiscountActive}`);
            
            if (therapist.discountEndTime) {
                const endTime = new Date(therapist.discountEndTime);
                const now = new Date();
                const isStillValid = endTime > now;
                console.log(`  Expires at: ${endTime.toISOString()}`);
                console.log(`  Current time: ${now.toISOString()}`);
                console.log(`  ✅ Still valid: ${isStillValid ? 'YES' : 'NO - EXPIRED!'}`);
            }
            
            // Check discount activation logic
            const hasDiscountData = !!(
                therapist.discountPercentage && 
                therapist.discountPercentage > 0 && 
                therapist.discountEndTime &&
                therapist.isDiscountActive === true
            );
            const endTime = therapist.discountEndTime ? new Date(therapist.discountEndTime) : null;
            const notExpired = endTime && !isNaN(endTime.getTime()) && endTime > new Date();
            const shouldShowDiscount = Boolean(hasDiscountData && notExpired);
            
            console.log(`  🔍 Should show discount badge: ${shouldShowDiscount ? '✅ YES' : '❌ NO'}`);
            console.log(`     - hasDiscountData: ${hasDiscountData}`);
            console.log(`     - notExpired: ${notExpired}`);
            
            // MASSAGE TYPES CHECK
            console.log(`\n💆 MASSAGE TYPES:`);
            console.log(`  Raw field: ${JSON.stringify(therapist.massageTypes)}`);
            console.log(`  Type: ${typeof therapist.massageTypes}`);
            console.log(`  Is Array: ${Array.isArray(therapist.massageTypes)}`);
            
            if (therapist.massageTypes) {
                if (typeof therapist.massageTypes === 'string') {
                    try {
                        const parsed = JSON.parse(therapist.massageTypes);
                        console.log(`  Parsed as JSON: ${JSON.stringify(parsed)}`);
                        console.log(`  Count: ${parsed.length}`);
                    } catch (e) {
                        console.log(`  ⚠️ Cannot parse as JSON: ${e.message}`);
                    }
                } else if (Array.isArray(therapist.massageTypes)) {
                    console.log(`  Array count: ${therapist.massageTypes.length}`);
                    console.log(`  Values: ${therapist.massageTypes.join(', ')}`);
                }
            } else {
                console.log(`  ❌ NOT SET or EMPTY`);
            }
            
            // LANGUAGES CHECK
            console.log(`\n🌐 LANGUAGES:`);
            console.log(`  Raw field: ${JSON.stringify(therapist.languages)}`);
            console.log(`  Type: ${typeof therapist.languages}`);
            console.log(`  Is Array: ${Array.isArray(therapist.languages)}`);
            
            if (therapist.languages) {
                if (typeof therapist.languages === 'string') {
                    console.log(`  String value: "${therapist.languages}"`);
                    console.log(`  Length: ${therapist.languages.length}`);
                    console.log(`  Is empty string: ${therapist.languages === ''}`);
                    
                    // Try parsing as JSON
                    try {
                        const parsed = JSON.parse(therapist.languages);
                        console.log(`  Parsed as JSON: ${JSON.stringify(parsed)}`);
                        console.log(`  Count: ${parsed.length}`);
                    } catch (e) {
                        console.log(`  ⚠️ Cannot parse as JSON, trying comma-split...`);
                        const split = therapist.languages.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        console.log(`  Split by comma: ${JSON.stringify(split)}`);
                        console.log(`  Count: ${split.length}`);
                    }
                } else if (Array.isArray(therapist.languages)) {
                    console.log(`  Array count: ${therapist.languages.length}`);
                    console.log(`  Values: ${therapist.languages.join(', ')}`);
                }
            } else {
                console.log(`  ❌ NOT SET or NULL/UNDEFINED`);
            }
            
            // PRICING CHECK
            console.log(`\n💰 PRICING:`);
            console.log(`  price60: ${therapist.price60 || 'NOT SET'}`);
            console.log(`  price90: ${therapist.price90 || 'NOT SET'}`);
            console.log(`  price120: ${therapist.price120 || 'NOT SET'}`);
            console.log(`  Old pricing field: ${therapist.pricing || 'NOT SET'}`);
        });
        
        console.log(`\n${'='.repeat(80)}\n`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
}

diagnoseTherapistCard();
