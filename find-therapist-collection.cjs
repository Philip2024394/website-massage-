const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790');

const databases = new sdk.Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function findTherapistCollection() {
  try {
    console.log('🔍 Listing all collections in database...\n');
    
    const collections = await databases.listCollections(DATABASE_ID);
    
    console.log(`✅ Found ${collections.total} collections:\n`);
    
    collections.collections.forEach((collection, index) => {
      console.log(`${index + 1}. Name: "${collection.name}"`);
      console.log(`   ID: ${collection.$id}`);
      console.log(`   Documents: ${collection.documentSecurity ? 'Document-level security' : 'Collection-level security'}`);
      console.log('');
    });
    
    // Try to find therapist-related collection
    const therapistCollection = collections.collections.find(c => 
      c.name.toLowerCase().includes('therapist') ||
      c.$id.toLowerCase().includes('therapist')
    );
    
    if (therapistCollection) {
      console.log('🎯 FOUND THERAPIST COLLECTION:');
      console.log(`   Name: ${therapistCollection.name}`);
      console.log(`   ID: ${therapistCollection.$id}`);
      console.log('\n📝 Update your .env file with:');
      console.log(`VITE_THERAPISTS_COLLECTION_ID=${therapistCollection.$id}`);
      
      // Try to list some documents
      try {
        const docs = await databases.listDocuments(DATABASE_ID, therapistCollection.$id, []);
        console.log(`\n✅ Collection is accessible! Found ${docs.documents.length} therapists`);
        
        if (docs.documents.length > 0) {
          console.log('\n👤 Sample therapist:');
          const sample = docs.documents[0];
          console.log(`   Name: ${sample.name || 'N/A'}`);
          console.log(`   ID: ${sample.$id}`);
          console.log(`   Status: ${sample.status || sample.availability || 'N/A'}`);
        }
      } catch (err) {
        console.log('\n⚠️ Could not list documents - check permissions');
      }
    } else {
      console.log('❌ No therapist collection found!');
      console.log('\n💡 Available collections:');
      collections.collections.forEach(c => console.log(`   - ${c.name} (${c.$id})`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findTherapistCollection();
