import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function checkReviewsCollection() {
    try {
        console.log('🔍 Checking for reviews collection...\n');
        
        // List all collections
        const collections = await databases.listCollections('68f76ee1000e64ca8d05');
        
        console.log('📋 Available collections:\n');
        collections.collections.forEach((col, index) => {
            console.log(`${index + 1}. ${col.name}`);
            console.log(`   ID: ${col.$id}`);
            console.log(`   Documents: ${col.documentSecurity ? 'Secured' : 'Public'}`);
            console.log('');
        });
        
        // Look for reviews collection
        const reviewsCol = collections.collections.find(c => 
            c.name.toLowerCase().includes('review') || 
            c.$id.toLowerCase().includes('review')
        );
        
        if (reviewsCol) {
            console.log('✅ Found Reviews Collection:');
            console.log(`   Name: ${reviewsCol.name}`);
            console.log(`   ID: ${reviewsCol.$id}`);
            console.log('\n📝 Update lib/appwrite/config.ts:');
            console.log(`   reviews: '${reviewsCol.$id}',`);
            
            // Check existing reviews
            try {
                const docs = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    reviewsCol.$id,
                    []
                );
                console.log(`\n📊 Current reviews: ${docs.documents.length}`);
                if (docs.documents.length > 0) {
                    console.log('\nSample review structure:');
                    console.log(JSON.stringify(docs.documents[0], null, 2));
                }
            } catch (e) {
                console.log('\n⚠️  Cannot read reviews (permission issue)');
            }
        } else {
            console.log('❌ No reviews collection found.');
            console.log('\n💡 SOLUTION: Create a reviews collection in Appwrite Console:');
            console.log('   1. Go to: https://syd.cloud.appwrite.io/console');
            console.log('   2. Select Database: 68f76ee1000e64ca8d05');
            console.log('   3. Create Collection: "Reviews"');
            console.log('   4. Add attributes (see below)');
            console.log('\n📋 Required attributes:');
            console.log('   - providerId (string/integer)');
            console.log('   - providerType (string) - therapist/place');
            console.log('   - providerName (string)');
            console.log('   - rating (integer) - 1-5');
            console.log('   - comment (string, optional)');
            console.log('   - reviewerName (string)');
            console.log('   - whatsapp (string)');
            console.log('   - avatar (string, optional)');
            console.log('   - status (string) - pending/approved/rejected');
            console.log('   - createdAt (string/datetime)');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkReviewsCollection();
