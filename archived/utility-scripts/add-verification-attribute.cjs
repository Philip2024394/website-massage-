/**
 * Add isVerified attribute to Therapist collection
 * This script adds the verification attribute to the Appwrite collection schema
 */

const { Client, Databases } = require('appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistCollection = 'therapists_collection_id';

async function addVerificationAttribute() {
    console.log('🔧 [SCHEMA UPDATE] ================================');
    console.log('🔧 Adding isVerified attribute to Therapist collection');
    console.log('🔧 [SCHEMA UPDATE] ================================');
    
    try {
        // Add isVerified boolean attribute
        console.log('📝 Adding isVerified boolean attribute...');
        
        const attribute = await databases.createBooleanAttribute(
            databaseId,
            therapistCollection,
            'isVerified', // attribute key
            false, // required
            false, // default value
            false  // array
        );
        
        console.log('✅ isVerified attribute added successfully!');
        console.log('📋 Attribute details:', {
            key: attribute.key,
            type: attribute.type,
            default: attribute.default,
            required: attribute.required
        });
        
        console.log('');
        console.log('⏳ [IMPORTANT] ================================');
        console.log('⏳ Appwrite is processing the schema change...');
        console.log('⏳ Wait 10-30 seconds before using the new attribute');
        console.log('⏳ [IMPORTANT] ================================');
        
        // Also add verifiedAt timestamp attribute
        console.log('');
        console.log('📝 Adding verifiedAt timestamp attribute...');
        
        const timestampAttribute = await databases.createStringAttribute(
            databaseId,
            therapistCollection,
            'verifiedAt', // attribute key
            255, // size
            false, // required
            null, // default value
            false  // array
        );
        
        console.log('✅ verifiedAt attribute added successfully!');
        console.log('📋 Attribute details:', {
            key: timestampAttribute.key,
            type: timestampAttribute.type,
            size: timestampAttribute.size,
            required: timestampAttribute.required
        });
        
    } catch (error) {
        console.error('❌ Failed to add attribute:', error.message);
        
        if (error.message.includes('Attribute already exists')) {
            console.log('✅ Attribute already exists - no action needed');
        } else if (error.message.includes('not authorized')) {
            console.log('💡 ERROR: You need admin permissions to modify collection schema');
            console.log('💡 SOLUTION: Log in to Appwrite Console and add the attribute manually:');
            console.log('   1. Go to https://cloud.appwrite.io/console');
            console.log('   2. Navigate to Database → therapists_collection_id');
            console.log('   3. Go to Attributes tab');
            console.log('   4. Add Boolean attribute: isVerified (optional, default: false)');
            console.log('   5. Add String attribute: verifiedAt (optional, size: 255)');
        }
    }
}

// Run the schema update
addVerificationAttribute().catch(console.error);