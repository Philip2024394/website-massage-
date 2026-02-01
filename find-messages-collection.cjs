// Find messages collection with more detailed search
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790');

const databases = new Databases(client);

async function findMessagesCollection() {
  try {
    console.log('🔍 SEARCHING FOR MESSAGES COLLECTION...\n');
    
    const collections = await databases.listCollections('68f76ee1000e64ca8d05');
    console.log(`Found ${collections.total} total collections\n`);
    
    // Look for any collection that might be the messages collection
    const candidates = collections.collections.filter(col => 
      col.$id === 'messages' || 
      col.name.toLowerCase() === 'messages' ||
      col.name.toLowerCase().includes('message') ||
      col.$id.toLowerCase().includes('message')
    );
    
    if (candidates.length > 0) {
      console.log('🎯 POTENTIAL MESSAGES COLLECTIONS:\n');
      for (const col of candidates) {
        console.log(`📋 ${col.name}`);
        console.log(`   ID: ${col.$id}`);
        console.log(`   Enabled: ${col.enabled}`);
        console.log(`   Permissions: ${col.$permissions}`);
        console.log('');
      }
    } else {
      console.log('❌ NO MESSAGES COLLECTIONS FOUND\n');
    }
    
    // Check if we can access the 'messages' collection directly
    console.log('🧪 TESTING DIRECT ACCESS TO "messages" COLLECTION...\n');
    
    try {
      const attributes = await databases.listAttributes('68f76ee1000e64ca8d05', 'messages');
      console.log('✅ SUCCESS! messages collection exists with attributes:');
      attributes.attributes.forEach(attr => {
        console.log(`   - ${attr.key} (${attr.type}) ${attr.required ? '[REQUIRED]' : ''}`);
      });
    } catch (directError) {
      console.log(`❌ Direct access failed: ${directError.message}`);
      
      if (directError.message.includes('Collection with the requested ID could not be found')) {
        console.log('\n💡 COLLECTION NOT CREATED YET');
        console.log('   Please create the "messages" collection in Appwrite Console with:');
        console.log('   - Collection ID: messages');
        console.log('   - Name: Messages (or any name you prefer)');
      }
    }
    
    // List recent collections (last 10)
    console.log('\n📋 RECENT COLLECTIONS (for reference):');
    const recentCollections = collections.collections.slice(0, 10);
    recentCollections.forEach(col => {
      console.log(`   - ${col.name} (ID: ${col.$id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findMessagesCollection();