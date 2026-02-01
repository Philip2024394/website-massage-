// Verify messages collection creation
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790');

const databases = new Databases(client);

async function verifyMessagesCollection() {
  try {
    console.log('\n🔍 VERIFYING MESSAGES COLLECTION CREATION...\n');
    
    // Get all collections
    const collections = await databases.listCollections('68f76ee1000e64ca8d05');
    
    // Look for messages collection
    const messagesCollection = collections.collections.find(col => col.$id === 'messages');
    
    if (messagesCollection) {
      console.log('✅ SUCCESS: messages collection FOUND!');
      console.log('   Name:', messagesCollection.name);
      console.log('   ID:', messagesCollection.$id);
      console.log('   Enabled:', messagesCollection.enabled);
      console.log('   Permissions:', messagesCollection.$permissions);
      
      // Get attributes
      console.log('\n📝 Checking collection attributes...');
      const attributes = await databases.listAttributes('68f76ee1000e64ca8d05', 'messages');
      console.log(`   Found ${attributes.total} attributes:`);
      
      // List all attributes
      attributes.attributes.forEach(attr => {
        const requiredText = attr.required ? '[REQUIRED]' : '[OPTIONAL]';
        const sizeText = attr.size ? `(size: ${attr.size})` : '';
        console.log(`   ✓ ${attr.key} (${attr.type}) ${requiredText} ${sizeText}`);
      });
      
      // Check for key attributes expected by messaging service
      const expectedAttributes = [
        'messageId', 'senderId', 'recipientId', 'content', 'sentAt', 
        'conversationId', 'senderName', 'message', 'messageType'
      ];
      
      console.log('\n🔍 Verifying required attributes for messaging service:');
      let allFound = true;
      
      expectedAttributes.forEach(expectedAttr => {
        const found = attributes.attributes.find(attr => attr.key === expectedAttr);
        if (found) {
          console.log(`   ✅ ${expectedAttr} - FOUND`);
        } else {
          console.log(`   ❌ ${expectedAttr} - MISSING`);
          allFound = false;
        }
      });
      
      if (allFound) {
        console.log('\n🎉 COLLECTION SETUP COMPLETE!');
        console.log('   The messages collection is ready for the chat booking system.');
        console.log('   You can now test the booking flow.');
      } else {
        console.log('\n⚠️ Some expected attributes are missing.');
        console.log('   The chat system may still work, but you might want to add missing attributes.');
      }
      
    } else {
      console.log('❌ ERROR: messages collection NOT FOUND');
      console.log('\nSearching for similar collections...');
      
      const messageCollections = collections.collections.filter(col => 
        col.$id.includes('message') || col.name.toLowerCase().includes('message')
      );
      
      if (messageCollections.length > 0) {
        console.log('Found these message-related collections:');
        messageCollections.forEach(col => {
          console.log(`   - ${col.name} (ID: ${col.$id})`);
        });
      } else {
        console.log('No message-related collections found.');
      }
    }
    
    // Test collection permissions
    if (messagesCollection && messagesCollection.$permissions) {
      console.log('\n🔒 Permission Analysis:');
      const permissions = messagesCollection.$permissions;
      
      const hasCreate = permissions.some(p => p.includes('create'));
      const hasRead = permissions.some(p => p.includes('read'));
      const hasUpdate = permissions.some(p => p.includes('update'));
      
      console.log(`   Create: ${hasCreate ? '✅' : '❌'}`);
      console.log(`   Read: ${hasRead ? '✅' : '❌'}`);
      console.log(`   Update: ${hasUpdate ? '✅' : '❌'}`);
      
      if (!hasCreate || !hasRead || !hasUpdate) {
        console.log('\n⚠️ WARNING: Missing permissions detected.');
        console.log('   You may need to add "any" role permissions in Appwrite Console.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error verifying collection:', error.message);
    console.error('Response:', error.response);
  }
}

verifyMessagesCollection();